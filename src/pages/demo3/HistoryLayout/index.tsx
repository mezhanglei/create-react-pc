import *as React from 'react';
import { DragGridRef, HistoryLayout } from './HistoryLayout'
import { Words } from './largedata';
import './index.css';

const fakeData = () => {
    var Y = 0;
    return Words.map((item, index) => {
        if (index % 4 === 0) Y++;

        return { ...item, GridX: index % 4 * 4, GridY: Y * 4, w: 4, h: 3, uniqueKey: index + '' }
    })
}


export const Card: (any: any) => any = React.forwardRef(({ item, style }, ref) => {
    return (
        <div
            className='layout-Item'
            ref={ref}
            style={{ ...style, background: '#fff' }}
        >
            <div
                style={{ padding: 5, textAlign: 'center', color: '#595959' }}
            >
                <span>title</span>
                <div style={{ borderBottom: '1px solid rgba(120,120,120,0.1)' }} />
                {item.content}
            </div>
            <span
                // {...provided.resizeHandle}
                style={{
                    position: 'absolute',
                    width: 10, height: 10, right: 2, bottom: 2, cursor: 'se-resize',
                    borderRight: '2px solid rgba(15,15,15,0.2)',
                    borderBottom: '2px solid rgba(15,15,15,0.2)'
                }}
            />
        </div>
    )
})


export class HistoryDemo extends React.Component {
    drag: DragGridRef;
    render() {
        const margin: [number, number] = [5, 5];
        const dragactInit = {
            width: 600,
            cols: 16,
            rowHeight: 40,
            margin: margin,
            className: 'normal-layout',
            layout: fakeData()
        }
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <div>
                    <h1 style={{ textAlign: 'center' }}>
                        复原操作demo
                    </h1>
                    <button onClick={() => {
                        if (this.drag) {
                            this.drag.back();
                        }
                    }}>back</button>
                    <button onClick={() => {
                        if (this.drag) {
                            this.drag.go();
                        }
                    }}>go</button>
                    <button onClick={() => {
                        if (this.drag) {
                            this.drag.clear();
                        }
                    }}>clear</button>
                    <HistoryLayout
                        {...dragactInit}
                        ref={(n: DragGridRef) => this.drag = n}
                        style={{
                            background: '#003A8C'
                        }}
                    >
                        {
                            dragactInit.layout?.map((item, index) => {
                                return <Card item={item} key={item.uniqueKey} />
                            })
                        }
                    </HistoryLayout>
                </div>
            </div>
        )
    }
}
