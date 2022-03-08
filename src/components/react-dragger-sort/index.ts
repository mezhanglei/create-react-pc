import DndArea from './dnd-area';
import DndItem from './dnd-item';
import BuildDndProvider from './dnd-provider';
import { arrayMove } from '@/utils/array';
import { deepSet, deepGet } from '@/utils/object';

const DndContextProvider = BuildDndProvider();
DndArea.Item = DndItem;
export default DndArea;
export { BuildDndProvider, DndContextProvider, arrayMove, deepSet, deepGet };
export * from './dnd-store';
