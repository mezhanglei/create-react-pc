import *as React from 'react';
import { Dragact } from '@/components/react-draggable-layout'
import { DragactLayoutItem } from '@/components/react-draggable-layout/dragact-type'
import { Words } from './largedata'
import './index.css';

const fakeData = () => {
    var Y = 0;
    return Words.map((item, index) => {
        if (index % 4 === 0) Y++;

        return { ...item, GridX: index % 4 * 4, GridY: Y * 4, w: 4, h: 3, key: index + '' }
    })
}


const Card: (any: any) => any = React.forwardRef(({ item, style }, ref) => {
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
        </div>
    )
})

export class Mobile extends React.Component<{}, {}> {
    render() {
        const margin: [number, number] = [5, 5];
        const dragactInit = {
            width: 500,
            col: 16,
            rowHeight: 45,
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
                        手机普通布局demo
                    </h1>
                    <Dragact
                        {...dragactInit}
                        style={{
                            background: '#003A8C'
                        }}
                    >
                        {
                            fakeData()?.map((item, index) => {
                                return <Card item={item} key={item.key} />
                            })
                        }
                    </Dragact>
                </div>
            </div>
        )
    }
}
