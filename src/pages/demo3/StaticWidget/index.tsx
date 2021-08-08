import * as React from 'react';
import { Dragact } from '@/components/react-draggable-layout'
import './index.css'

const Words = [
    { content: 'Sorry I just can not move in any circumstances', forbid: true },
    { content: 'Those who dare to fail miserably can achieve greatly.' },
    { content: 'You miss 100 percent of the shots you never take.' },
    { content: 'Sorry I just can not move in any circumstances,too' },
    { content: 'I’d rather live with a good question than a bad answer.' }
]

const fakeData = () => {
    var Y = 0;
    return Words.map((item, index) => {
        if (index % 4 === 0) Y++;

        return { ...item, GridX: index % 4 * 4, GridY: Y * 4, w: 4, h: 4, key: index + '', canResize: false }
    })
}

const Cell: (any: any) => any = React.forwardRef(({ item, style }, ref) => {
    return (
        <div
            ref={ref}
            className={`layout-Cell ${item.forbid ? "static" : ""}`}
            style={{ ...style, background: item.forbid ? "#e8e8e8" : "" }}
        >
            <div style={{ padding: 10, color: '#595959' }}>{item.content}</div>
        </div>
    )
})

export const SortedTableWithStatic = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div>
                <h1 style={{ textAlign: 'center' }}>静态组件 Demo</h1>
                <Dragact
                    width={600}
                    col={16}
                    rowHeight={30}
                    margin={[2, 2]}
                    className='normal-layout'
                    layout={fakeData()}
                >
                    {
                        fakeData()?.map((item, index) => {
                            return <Cell item={item} key={item.key} />
                        })
                    }
                </Dragact>
            </div>
        </div>
    )
}