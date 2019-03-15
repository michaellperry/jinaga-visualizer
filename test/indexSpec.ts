import { expect } from "chai";
import { factAdded } from "../src/fact-added";
import { VisualizerNode } from "../src/visualizer-node";

describe("Jinaga Visualizer", () => {
    let nodes = [] as VisualizerNode[];

    function setNodes(transformer: (oldValue: VisualizerNode[]) => VisualizerNode[]) {
        nodes = transformer(nodes);
    }

    beforeEach(() => {
        nodes = [];
    });

    it("should start as an empty array", () => {
        factAdded(setNodes);
        expect(nodes).to.deep.equal([]);
    });
});