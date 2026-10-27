// Local QA only. Proxy a production build with a shared bandwidth limit.
// No browser control, no external requests, and no telemetry is transmitted.
const http = require("node:http");
const zlib = require("node:zlib");
const delay = Number(process.env.QA_DELAY_MS || 300);
const rate = Number(process.env.QA_BYTES_PER_SECOND || 200000);
const port = Number(process.env.QA_PORT || 3002);
const upstream = Number(process.env.QA_UPSTREAM_PORT || 3000);
let nextByteAt = Date.now();
const script = `<script>(()=>{const m={mode:'Local lab: shared 1.6 Mbps, 300 ms per request, desktop CPU',LCP_ms:null,CLS:0,maxInteraction_ms:null,FCP_ms:null,resources:0,transfer_KB:0};let panel;const render=()=>{if(!panel){panel=document.createElement('pre');panel.id='performance-report';panel.setAttribute('aria-label','Performance QA report');panel.style.cssText='position:fixed;bottom:80px;right:8px;z-index:99999;max-width:350px;font:10px/1.5 monospace;padding:12px;border:1px solid #9aa;background:#fff;color:#123;pointer-events:none;white-space:pre-wrap';document.body.append(panel)}const rs=performance.getEntriesByType('resource');m.resources=rs.length;m.transfer_KB=Math.round(rs.reduce((s,r)=>s+r.transferSize,0)/1024);panel.textContent=JSON.stringify(m,null,2)};const observe=(type,fn,extra={})=>{try{new PerformanceObserver(l=>{l.getEntries().forEach(fn);if(document.body)render()}).observe({type,buffered:true,...extra})}catch{}};observe('largest-contentful-paint',e=>m.LCP_ms=Math.round(e.startTime));observe('layout-shift',e=>{if(!e.hadRecentInput)m.CLS=Math.round((m.CLS+e.value)*10000)/10000});observe('event',e=>{if(e.interactionId)m.maxInteraction_ms=Math.max(m.maxInteraction_ms||0,e.duration)},{durationThreshold:16});observe('paint',e=>{if(e.name==='first-contentful-paint')m.FCP_ms=Math.round(e.startTime)});addEventListener('load',render);setInterval(()=>{if(document.body)render()},1500)})();</script>`;
http
  .createServer((req, res) => {
    const request = http.request(
      {
        hostname: "127.0.0.1",
        port: upstream,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `127.0.0.1:${upstream}`,
          "accept-encoding": "identity",
        },
      },
      (response) => {
        const chunks = [];
        response.on("data", (c) => chunks.push(c));
        response.on("end", () => {
          let data = Buffer.concat(chunks);
          const type = response.headers["content-type"] || "";
          const headers = { ...response.headers, "cache-control": "no-store" };
          delete headers["transfer-encoding"];
          delete headers["content-length"];
          delete headers.etag;
          if (type.includes("text/html"))
            data = Buffer.from(
              data.toString().replace("</body>", script + "</body>"),
            );
          if (/text|javascript|json/.test(type)) {
            data = zlib.gzipSync(data);
            headers["content-encoding"] = "gzip";
          }
          headers["content-length"] = data.length;
          const available = Date.now() + delay;
          const slots = [];
          for (let offset = 0; offset < data.length; offset += 16000) {
            const part = data.subarray(offset, offset + 16000);
            const at = Math.max(available, nextByteAt);
            nextByteAt = at + (part.length / rate) * 1000;
            slots.push({ part, at });
          }
          if (!slots.length)
            setTimeout(() => {
              res.writeHead(response.statusCode, headers);
              res.end();
            }, delay);
          slots.forEach(({ part, at }, i) =>
            setTimeout(
              () => {
                if (!res.destroyed) {
                  if (!res.headersSent)
                    res.writeHead(response.statusCode, headers);
                  res.write(part);
                  if (i === slots.length - 1) res.end();
                }
              },
              Math.max(0, at - Date.now()),
            ),
          );
        });
      },
    );
    request.on("error", () => {
      res.writeHead(502);
      res.end("Start the local production preview first.");
    });
    req.pipe(request);
  })
  .listen(port, "127.0.0.1", () =>
    console.log(
      `Performance QA proxy: http://127.0.0.1:${port} → localhost:${upstream}, ${rate} bytes/s shared, ${delay} ms/request.`,
    ),
  );
