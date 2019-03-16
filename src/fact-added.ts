import { FactRecord, FactReference, PredecessorCollection } from "jinaga";
import { SuccessorCollection, VisualizerGraph } from "./visualizer-node";

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
    const oldHashes = successors[roleAndType];
    const hashes = oldHashes ? [
        ...oldHashes,
        successorReference.hash
    ] : [
        successorReference.hash
    ];
    return {
        ...successors,
        [roleAndType]: hashes
    };
}

function addNewVisualizerNode(factRecord: FactRecord): Transformer {
    return oldValue => transformAddNewVisualizerNode(factRecord, oldValue);
}

function transformAddNewVisualizerNode(factRecord: FactRecord, oldValue: VisualizerGraph) {
    const predecessorDepths = allPredecessorsAndRoles(factRecord)
        .map(({ predecessor }) => lookup(oldValue, predecessor))
        .reduce((a, b) => a.concat(b), [])
        .map(r => r.depth);
    const depth = predecessorDepths.length > 0
        ? Math.max(...predecessorDepths) + 1 : 0;
    return ({
        ...oldValue,
        [nodeKey(factRecord)]: {
            fact: factRecord,
            successors: {},
            depth
        }
    });
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
    return Array.from(allPredecessorsAndRolesGenerator(factRecord.predecessors));
}

function* allPredecessorsAndRolesGenerator(predecessorCollection: PredecessorCollection) {
    for (const role in predecessorCollection) {
        const predecessors = predecessorCollection[role];
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