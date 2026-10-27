import { ArrowRight } from "lucide-react";
import { AppIcon } from "./app-icon";
import { workspaceTools } from "./workspace-tools";
import { type Collection, type Project, projects } from "./workspace-data";

const ideas: Partial<Record<Collection, string>> = {
  Python:
    "Have a repetitive workflow in mind? Share the steps, data sources and result you need, and we can explore an automation approach.",
  Flutter:
    "Planning a mobile experience? Start with the people using it, the platforms you need and the most important screens.",
  WordPress:
    "Need a website you can manage yourself? Let’s discuss your pages, publishing workflow and the features your business needs.",
  Figma:
    "From a first idea to a clearer interface: discuss your user journeys, screen designs and prototype requirements.",
  Photoshop:
    "Bring your image-editing brief, reference images and intended use so we can discuss the right visual direction.",
  Illustrator:
    "Have a brand or vector artwork in mind? Share your references and the formats you need for print or digital use.",
  "Premiere Pro":
    "Planning a video? Start with your footage, audience, story and the formats you want to publish.",
  "After Effects":
    "Discuss motion graphics, animated titles or product explainers with references for the movement and tone you have in mind.",
  Blender:
    "Explore a 3D brief: product visuals, scenes or animation. Share references, output formats and the level of detail you need.",
  "Unreal Engine":
    "Have an interactive 3D experience in mind? Discuss the environment, target devices and interactions before choosing an approach.",
  "Cinema 4D":
    "Start a conversation about 3D visuals or motion, from the look and style to the final renders and delivery format.",
};
export function ToolCollectionIntro({
  collection,
  onContact,
  onProject,
}: {
  collection: Collection;
  onContact: () => void;
  onProject: (project: Project) => void;
}) {
  const tool = workspaceTools.find((entry) => entry.collection === collection);
  return (
    <section className="tool-collection-intro">
      <div className="collection-intro-heading">
        <AppIcon name={tool?.id ?? "finder"} />
        <span className="eyebrow">LET’S EXPLORE YOUR IDEA</span>
      </div>
      <h3>A {collection} project in mind?</h3>
      <p>
        {ideas[collection] ??
          "Tell me what you want to build, who it’s for and what a successful result would look like."}
      </p>
      <p className="collection-availability">
        No published {collection} case study yet. We can discuss your
        requirements and whether the project is a good fit.
      </p>
      <button className="primary-button" onClick={onContact}>
        Discuss this type of project <ArrowRight size={14} />
      </button>
      <div className="related-work">
        <h4>Explore my website work</h4>
        <p>These projects show my design and development approach.</p>
        {projects.slice(0, 2).map((project) => (
          <button
            key={project.id}
            className="secondary-button"
            onClick={() => onProject(project)}
          >
            {project.name}
            <ArrowRight size={14} />
          </button>
        ))}
      </div>
    </section>
  );
}
