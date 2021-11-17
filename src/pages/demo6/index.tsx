import { DrawBoard, DrawItem } from '@/components/react-div-controller';
import React from 'react';
import "./index.less"

const points = ['e', 'w', 's', 'n', 'ne', 'nw', 'se', 'sw']

class Drawing extends React.Component<{}, {}> {
    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() {

        const {
            style
        } = this.state;

        // const kids = React.Children.map(this.props.children, (child) => {

        // });

        return (
            <DrawBoard>
                <DrawItem>
                    <div className="drawing-item" style={style}>
                        {points.map(item => <div key={item} className={`control-point point-${item}`}></div>)}
                        <div className="control-point control-rotator"></div>
                    </div>
                </DrawItem>
            </DrawBoard>
        )
    }
}

export default Drawing