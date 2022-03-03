import buildDndArea from './dnd-area-builder';
import DndItem from './dnd-item';
import DndContextProvider from './dnd-provider';

const DndArea = buildDndArea();
DndArea.Item = DndItem;
export default DndArea;
export { DndContextProvider };
