import { DrawBoard, DrawItem } from '@/components/react-div-controller';
import React from 'react';
import "./index.less";
import { Button } from 'antd';

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
          <DrawItem className="wrap-item">
            <div>
              22222222
            </div>
          </DrawItem>
        </DrawBoard>
        <Button onClick={() => this.setState({ isOpended: !this.state.isOpended })}>
          展开
        </Button>
      </>
    );
  }
}

export default Drawing;
