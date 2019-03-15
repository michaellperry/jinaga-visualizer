import { Jinaga } from "jinaga";
import { factAdded, Mutator } from "../fact-added";
import { VisualizerNode } from "../visualizer-node";

interface VisualizerProps {
    j: Jinaga;
}

function useState<T>(initialState: T): [ T, Mutator<T> ] {
    throw new Error("Not yet implemented.");
}

function useEffect(effect: () => () => void) {
    throw new Error("Probably never will be.");
}

export const Visalizer = ({ j }: VisualizerProps) => {
    const [ nodes, setNodes ] = useState([] as VisualizerNode[]);
    useEffect(() => {
        return j.onFactAdded(factAdded(setNodes));
    });
}