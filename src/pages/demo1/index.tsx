import React, { Component, useState, useRef, useEffect } from 'react';
import "./index.less";
import Draggable from '@/components/react-free-draggable';
import Button from '@/components/button';
import DragResize from '@/components/react-resize-zoom';
import { DraggableAreaGroup, DraggerItem } from "@/components/react-dragger-sort";
import VirtualList from '@/components/react-mini-virtual-list';
import { DragMoveHandle } from '@/components/react-dragger-sort/utils/types';
import { arrayMove } from '@/utils/array';
import produce from "immer";

const DraggableAreaGroups = new DraggableAreaGroup();
const DraggableArea1 = DraggableAreaGroups.create()
const DraggableArea2 = DraggableAreaGroups.create()

const Demo1: React.FC<any> = (props) => {
    const [x, setX] = useState<any>(10);
    const [y, setY] = useState<any>(10);
    const [dataSource, setDataSource] = useState([...new Array(100).keys()]);

    const [state, setState] = useState({ arr1: [1, 2, 3, 4, 5, 6, 7], arr2: [8, 9, 10, 11, 12, 13, 14] })

    const onDrag = (e, data) => {
        // setX(data?.x)
        // setY(data?.y)
    }

    const onDragMoveEnd1: DragMoveHandle = (tag, coverChild) => {
        if (tag && coverChild) {
            setState(state => {
                const preIndex = state?.arr1?.findIndex((item) => item === tag?.id);
                const nextIndex = state?.arr1?.findIndex((item) => item === coverChild?.id)
                const newArr = arrayMove(state?.arr1, preIndex, nextIndex);
                return {
                    ...state,
                    arr1: newArr
                }
            });
        }
    }

    const onDragMoveEnd2: DragMoveHandle = (tag, coverChild, e) => {
        if (tag && coverChild) {
            setState(state => {
                const preIndex = state?.arr2?.findIndex((item) => item === tag?.id);
                const nextIndex = state?.arr2?.findIndex((item) => item === coverChild?.id)
                const newArr = arrayMove(state?.arr2, preIndex, nextIndex);
                return {
                    ...state,
                    arr2: newArr
                }
            });
        }
    }

    const onMoveOutChange = (data) => {
        if (data) {
            setState(state => {
                const newArr = produce(state?.arr1, draft => {
                    const index = draft?.findIndex((item) => item === data?.moveTag?.id)
                    draft?.splice(index, 1)
                });
                return {
                    ...state,
                    arr1: newArr
                }
            })
        }
    }

    const onMoveInChange = (data) => {
        if (data) {
            setState(state => {
                const newArr = produce(state?.arr2, draft => {
                    const index = state?.arr1?.findIndex((item) => item === data?.moveTag?.id);
                    const nextIndex = draft?.findIndex((item) => item === data?.coverChild?.id);
                    draft?.splice(nextIndex, 0, state?.arr1?.[index]);
                });
                return {
                    ...state,
                    arr2: newArr
                }
            })
        }
    }

    const renderOn = (startIndex, stopIndex) => {
        // console.log(startIndex, stopIndex);
    };

    const renderItem = (item: any, index: number) => {
        return (
            <div className="Row" key={index}>
                Row #{item}
            </div>
        );
    };

    return (
        <>
            <div className="boxs" style={{ display: 'inline-block', marginLeft: '100px', marginTop: '100px', width: '500px', background: "red" }}>
                <Draggable
                    axis="both"
                    bounds=".boxs"
                    dragNode=".handle"
                    x={x}
                    y={y}
                    onDrag={onDrag}
                    grid={[100, 25]}
                    scale={1}
                >
                    <div style={{ display: "inline-block", width: '200px', background: 'blue' }}>
                        <Button className="handle" type="default">
                            拖拽元素1
                        </Button>
                    </div>
                </Draggable>
            </div>
            <DraggableArea1 dataSource={state?.arr1} onMoveOutChange={onMoveOutChange} style={{display: 'flex', flexWrap: 'wrap', background: 'blue', width: '200px'}} onDragMoveEnd={onDragMoveEnd1}>
                {
                    state?.arr1?.map((item, index) => {
                        return (
                            <DraggerItem style={{width: '50px',height: '50px', backgroundColor: 'red', border:'1px solid green'}} resizeAxis='auto' key={item} id={item}>
                                <div>
                                    大小拖放{item}
                                </div>
                            </DraggerItem>
                        )
                    })
                }
            </DraggableArea1>
            <div style={{ marginTop: '10px' }}>
                <DraggableArea2 dataSource={state?.arr2} onMoveInChange={onMoveInChange} style={{display: 'flex', flexWrap: 'wrap', background: 'blue', width: '200px'}} onDragMoveEnd={onDragMoveEnd2}>
                    {
                        state?.arr2?.map((item, index) => {
                            return (
                                <DraggerItem style={{width: '50px',height: '50px', backgroundColor: 'red', border:'1px solid green'}} key={item} id={item}>
                                    <div>
                                        大小拖放{item}
                                    </div>
                                </DraggerItem>
                            )
                        })
                    }
                </DraggableArea2>
            </div>
            <VirtualList
                width="auto"
                // scrollToAlignment="start"
                // scrollToIndex={30}
                scrollOffset={500}
                height={400}
                limit={200}
                dataSource={dataSource}
                onItemsRendered={renderOn}
                itemSize={50}
                className="VirtualList"
            >
                {
                    dataSource?.map((item, index) => {
                        return renderItem(item, index);
                    })
                }
                </VirtualList>
        </>
    );
}

export default Demo1;