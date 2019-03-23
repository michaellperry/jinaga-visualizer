import { FactRecord, FactReference } from "jinaga";
import { SuccessorCollection, VisualizerGraph, VisualizerNode } from "./visualizer-node";

export type Mutator<T> = (transformer: (oldValue: T) => T) => void;

export function factAdded(setNodes: Mutator<VisualizerGraph>) {
    return (factRecord: FactRecord) => {
        const transformers = [
            addSuccessors(factRecord),
            addNewVisualizerNode(factRecord)
        ];
        setNodes(transformers.reduce(compose, t => t));
    }
}

type Transformer = (oldValue: VisualizerGraph) => VisualizerGraph;

function compose(a: Transformer, b: Transformer): Transformer {
    return oldValue => b(a(oldValue));
}

function addSuccessors(factRecord: FactRecord): Transformer {
    return oldValue => allPredecessorsAndRoles(factRecord)
        .map(({ role, predecessor }) => ({
            role,
            key: nodeKey(predecessor)
        }))
        .filter(({ key }) => oldValue.hasOwnProperty(key))
        .reduce((graph, { role, key }) => ({
            ...graph,
            [key]: {
                ...graph[key],
                successors: addSuccessor(
                    graph[key].successors,
                    role,
                    factRecord)
            }
        }), oldValue);
}

function addSuccessor(
    successors: SuccessorCollection,
    role: string,
    successorReference: FactReference
): SuccessorCollection {
    const roleAndType = `${role}:${successorReference.type}`;
    const oldNodeKeys = successors[roleAndType];
    const nodeKeys = oldNodeKeys ? [
        ...oldNodeKeys,
        nodeKey(successorReference)
    ] : [
        nodeKey(successorReference)
    ];
    return {
        ...successors,
        [roleAndType]: nodeKeys
    };
}

function addNewVisualizerNode(factRecord: FactRecord): Transformer {
    return oldValue => transformAddNewVisualizerNode(factRecord, oldValue);
}

function transformAddNewVisualizerNode(factRecord: FactRecord, graph: VisualizerGraph) {
    const predecessorDepths = allPredecessorsAndRoles(factRecord)
        .map(({ predecessor }) => lookup(graph, predecessor))
        .reduce((a, b) => a.concat(b), [])
        .map(r => ({ depth: r.depth, left: r.left, right: r.right, successors: r.successors }));
    const parent = predecessorDepths.reduce((max, p) =>
        p.depth > max.depth ? p : max,
        { depth: -1, left: 0, right: 1, successors: {} }
    );
    const anySuccessors = parent.right > parent.left + 1 ||
        allSuccessors(parent.successors).some(key => graph.hasOwnProperty(key))
    const shiftedGraph = anySuccessors ? shiftGraph(graph, parent.depth, parent.right) : graph;
    const left = anySuccessors ? parent.right : parent.left;
    return ({
        ...shiftedGraph,
        [nodeKey(factRecord)]: {
            fact: factRecord,
            successors: {},
            depth: parent.depth + 1,
            left,
            right: left + 1
        }
    });
}

function shiftGraph(graph: VisualizerGraph, depth: number, column: number): VisualizerGraph {
    return Object.keys(graph).reduce((g, graphKey) => ({
        ...g,
        [graphKey]: shiftNode(graph[graphKey], depth, column)
    }), {});
}

function shiftNode(node: VisualizerNode, depth: number, column: number): VisualizerNode {
    return {
        ...node,
        left: node.left + (node.left >= column ? 1 : 0),
        right: node.right +
            (node.right > column || (node.right == column && node.depth <= depth) ? 1 : 0)
    };
}

function nodeKey(factRecord: FactReference) {
    return `${factRecord.type}:${factRecord.hash}`;
}

function lookup(graph: VisualizerGraph, reference: FactReference) {
    const key = nodeKey(reference);
    const node = graph[key];
    return node ? [ node ] : [];
}

function allPredecessorsAndRoles(factRecord: FactRecord) {
    function* generator() {
        for (const role in factRecord.predecessors) {
            const predecessors = factRecord.predecessors[role];
            if (Array.isArray(predecessors)) {
                for (let index = 0; index < predecessors.length; index++) {
                    yield {
                        role,
                        predecessor: predecessors[index]
                    };
                }
            }
            else {
                yield {
                    role,
                    predecessor: predecessors
                };
            }
        }
    }
    
    return Array.from(generator());
}

function allSuccessors(successors: SuccessorCollection) {
    function* generator() {
        for (const roleAndType in successors) {
            const successorArray = successors[roleAndType];
            for (let i = 0; i < successorArray.length; i++) {
                yield successorArray[i];
            }
        }
    }
    return Array.from(generator());
}