import DndArea from './dnd-area';
import DndItem from './dnd-item';
import BuildDndProvider from './dnd-provider';
import { arrayMove } from '@/utils/array';
import { deepSet } from '@/utils/object';

const DndContextProvider = BuildDndProvider();
DndArea.Item = DndItem;
export default DndArea;
export { BuildDndProvider, DndContextProvider, arrayMove, deepSet };
export * from './dnd-store';
