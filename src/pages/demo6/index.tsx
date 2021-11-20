import { DirectionCode, DrawBoard, DrawItem } from '@/components/react-div-controller';
import React from 'react';
import "./index.less"

class Drawing extends React.Component<{}, {}> {
    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() {

        return (
            <DrawBoard className="wrap">
                <DrawItem width={500}>
                    <div className="drawing-item">
                        {DirectionCode?.map((item) => (<div className={`control-point point-${item}`}></div>))}
                    </div>
                </DrawItem>
            </DrawBoard>
        )
    }
}

export default Drawing