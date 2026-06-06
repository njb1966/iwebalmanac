export const sections = [
  {
    id: "fiction",
    label: "Fiction",
    singular: "Fiction",
    description:
      "Selected stories, excerpts, and experiments that show human-guided creative work in practice.",
  },
  {
    id: "essays",
    label: "Essays",
    singular: "Essay",
    description:
      "Long-form editorial writing on craft, publishing, creativity, technology, and culture.",
  },
  {
    id: "reviews",
    label: "Reviews",
    singular: "Review",
    description:
      "Books, tools, software, and publishing platforms considered through craft and reader experience.",
  },
  {
    id: "interviews",
    label: "Interviews",
    singular: "Interview",
    description:
      "Conversations with creators, editors, publishers, researchers, and tool builders about process.",
  },
  {
    id: "resources",
    label: "Resources",
    singular: "Resource",
    description:
      "Practical guides and references for planning, publishing, continuity, workflow, and evaluation.",
  },
];

export const sectionIds = sections.map((section) => section.id);

export function getSection(id) {
  return sections.find((section) => section.id === id);
}
