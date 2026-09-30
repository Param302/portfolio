import { parseResumeInline } from "@/lib/resume-inline";

function renderNodes(nodes) {
  return nodes.map((node, index) => {
    if (node.type === "strong") return <strong key={index}>{renderNodes(node.children)}</strong>;
    if (node.type === "em") return <em key={index}>{renderNodes(node.children)}</em>;
    return node.value;
  });
}

export default function ResumeInline({ children }) {
  return renderNodes(parseResumeInline(children));
}
