import { expect } from "chai";
import { factAdded } from "../src/fact-added";
import { VisualizerNode } from "../src/visualizer-node";
import { Jinaga, JinagaBrowser } from "jinaga";

describe("Jinaga Visualizer", () => {
    let nodes = [] as VisualizerNode[];
    let j = null as Jinaga;
    let dispose = () => {};

    function setNodes(transformer: (oldValue: VisualizerNode[]) => VisualizerNode[]) {
        nodes = transformer(nodes);
    }

    beforeEach(() => {
        nodes = [];
        j = JinagaBrowser.create({});
        dispose = j.onFactAdded(factAdded(setNodes));
    });

    afterEach(() => {
        dispose();
    });

    it("should start as an empty array", () => {
        expect(nodes).to.deep.equal([]);
    });

    it("should add a node when a fact is added", async () => {
        const tag = await j.fact({
            type: "Blog.Tag",
            name: "React"
        });
        
        expect(nodes).to.deep.equal(<VisualizerNode[]>[
            {
                fact: {
                    type: "Blog.Tag",
                    hash: j.hash(tag),
                    fields: {
                        name: "React"
                    },
                    predecessors: {}
                },
                successors: {}
            }
        ]);
    });

    it("should add a successor to an existing visualizer node", async () => {
        const tag = await j.fact({
            type: "Blog.Tag",
            name: "React"
        });
        const postTags = await j.fact({
            type: "Blog.Post.Tags",
            tags: [ tag ]
        });

        expect(nodes).to.deep.equal(<VisualizerNode[]>[
            {
                fact: {
                    type: "Blog.Tag",
                    hash: j.hash(tag),
                    fields: {
                        name: "React"
                    },
                    predecessors: {}
                },
                successors: {
                    "tags:Blog.Post.Tags": [
                        j.hash(postTags)
                    ]
                }
            },
            {
                fact: {
                    type: "Blog.Post.Tags",
                    hash: j.hash(postTags),
                    fields: {},
                    predecessors: {
                        tags: [
                            {
                                type: "Blog.Tag",
                                hash: j.hash(tag)
                            }
                        ]
                    }
                },
                successors: {}
            }
        ])
    });
});