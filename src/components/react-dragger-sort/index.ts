import BuildDndSortable from './dnd-core';
import { arrayMove } from '@/utils/array';
import { deepSet, deepGet } from '@/utils/object';

const DndSortable = BuildDndSortable();
export default DndSortable;
export { BuildDndSortable, arrayMove, deepSet, deepGet };
export * from './utils/types';