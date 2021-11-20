import { DirectionCode, DrawBoard, DrawItem } from '@/components/react-div-controller';
import { Collapse } from '@/components/react-collapse';
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
            <>
                <DrawBoard className="wrap">
                    <DrawItem width={500}>
                        <div className="drawing-item">
                            {DirectionCode?.map((item) => (<div className={`control-point point-${item}`}></div>))}
                        </div>
                    </DrawItem>
                </DrawBoard>
                <div onClick={() => this.setState({isOpended: true})}>
                    button
                </div>
                <Collapse isOpened={this.state.isOpended}>
                    11111111111111111111111111111111111111111111111111111111111
                </Collapse>
            </>
        )
    }
}

export default Drawing