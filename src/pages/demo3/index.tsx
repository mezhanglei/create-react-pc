import * as React from "react";
import { LayoutDemo } from './NormalLayout/index';
import { SortedTableWithStatic } from "./StaticWidget/index";
import { LayoutRestore } from "./LayoutRestore/index";
import { AddRemove } from "./AddRemove/index";
import { HistoryDemo } from "./HistoryLayout/index";
import './index.less'



const DemoMap: any = {
    normalLayout: <LayoutDemo />,
    // SortedTable: <SortedTable />,
    StaticHeader: <SortedTableWithStatic />,
    LayoutRestore: <LayoutRestore />,
    AddRemove: <AddRemove />,
    HistoryLayout: <HistoryDemo />
}

class DemoDispatcher extends React.Component<{}, {}> {

    state = {
        demo: <LayoutDemo />
    }

    handleLayoutChange = (demoName: string) => {
        this.setState({
            demo: DemoMap[demoName]
        })
    }

    render() {
        return (
            <div>
                <div>切换 Demos</div>
                <div className='demo-button-layout'>
                    <button onClick={() => this.handleLayoutChange('normalLayout')}>普通布局</button>
                    <button onClick={() => this.handleLayoutChange('StaticHeader')}>静态组件</button>
                    <button onClick={() => this.handleLayoutChange('LayoutRestore')}>存储布局</button>
                    <button onClick={() => this.handleLayoutChange('HistoryLayout')}>记忆操作布局</button>
                    <button onClick={() => this.handleLayoutChange('AddRemove')}>增加和删除</button>
                </div>
                {this.state.demo}
            </div>
        )
    }
}

export default DemoDispatcher;


document.addEventListener('touchmove', function (e) { e.preventDefault() }, false);