import React from 'react';
import './treenode.less';
import CheckBox from "@/components/checkbox/index";
import classNames from "classnames";

/**
 * 生成节点
 * 参数说明：
 * type：string  drop表示带折叠图标的选项
 * folder: boolean  折叠状态
 * checked: boolean 选中状态
 * disabled: boolean 禁用状态
 * indeterminate: boolean 不完全选中状态, 优先级比checked高
 * onCheck: function(checked) {}  选中选项的回调函数
 * switch: function(folder) {}  切换折叠态的回调函数
 * children: 子元素
 * <TreeNode> </TreeNode>
 */

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    };

    static defaultProps = {
        prefixCls: "tree-node"
    }

    componentDidUpdate(preProps, preState) {
        // 异步更新的字段
        const changeProps = ['folder'];
        changeProps.map(item => {
            if (preProps[item]?.toString() != this.props[item]?.toString()) {
                this.setState({
                    [item]: this.props[item] && JSON.parse(JSON.stringify(this.props[item]))
                });
            }
        });
    }

    // 切换点击事件
    changeCheck(checked) {
        if (this.props.disabled) {
            return;
        }
        this.props.onCheck && this.props.onCheck(checked);
    };

    // 切换折叠状态
    switchIcon() {
        this.setState({
            folder: !this.state.folder
        });
        this.props.switch && this.props.switch(!this.state.folder);
    };

    // 可折叠的选项
    dropNode() {
        const { folder } = this.state;
        const { prefixCls, disabled, checked, className, indeterminate } = this.props;

        const boxClass = classNames(prefixCls, className, {
            [`${prefixCls}-disabled`]: disabled
        });

        const iconClass = classNames('folder-icon-down', {
            [`folder-icon-transition`]: folder
        });

        return (
            <div className={boxClass}>
                <i onClick={() => this.switchIcon()} className={iconClass}></i>
                <span className='content'>
                    <CheckBox indeterminate={indeterminate} checked={checked} disabled={disabled} onChange={this.changeCheck.bind(this)}>{this.props.children}</CheckBox>
                </span>
            </div>
        );
    }

    render() {
        const { disabled, checked, type, indeterminate } = this.props;
        return (
            <>
                {type == "drop" && this.dropNode()}
                {type != "drop" && <CheckBox indeterminate={indeterminate} checked={checked} disabled={disabled} onChange={this.changeCheck.bind(this)}>{this.props.children}</CheckBox>}
            </>
        );
    }
}
