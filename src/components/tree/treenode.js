import React from 'react';
import styles from './treenode.less';


/**
 * 参数说明：
 * type：表示该项的类型，type="drop"表示带折叠图标的选项，默认普通选项
 * folder: 表示折叠图标为折叠状态还是展开状态 默认false折叠
 * checked 布尔值 true表示选中 默认没有选中
 * disabled 布尔值 true表示不能点击 默认可点击
 * indeterminate true表示该项嵌套的子元素有被选中, 优先级比checked高
 * value 表示文字
 * onCheck 选中选项的回调函数: function(checked) {}
 * switch 切换折叠态的回调函数: function(folder) {}
 * <TreeNode />
 */

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = { ...props };
    };

    componentDidUpdate(preProps, preState) {
        // 异步更新的字段
        const changeProps = ["type", 'folder', "checked", "disabled", "indeterminate", "value"];
        changeProps.map(item => {
            if (preProps[item]?.toString() != this.props[item]?.toString()) {
                this.setState({
                    [item]: this.props[item] && JSON.parse(JSON.stringify(this.props[item]))
                });
            }
        });
    }

    // 切换点击事件
    changeCheck() {
        if (this.state.disabled) {
            return;
        }
        this.setState({
            checked: !this.state.checked
        });
        this.props.onCheck && this.props.onCheck(!this.state.checked);
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
        const { disabled, checked, folder, className, indeterminate, value } = this.state;
        return (
            <div className={disabled ? `${styles["tree-node-default"]} ${styles["tree-node-disabled"]} ${className}` : `${styles["tree-node-default"]} ${className}`}>
                <div className={styles["content"]}>
                    <i onClick={() => this.switchIcon()} className={folder ? `${styles["folder-icon-down"]} ${styles["folder-icon-transition"]}` : styles["folder-icon-down"]}></i>
                    <span style={{ marginLeft: "4px" }} onClick={() => this.changeCheck()} className={indeterminate ? styles["check-box-indeterminate"] : (checked ? styles["check-box-selected"] : styles["check-box-default"])}></span>
                    {this.props.children ?? <span className={styles["folder-text-default"]}>{value}</span>}
                </div>
            </div>
        );
    }

    // 普通选项
    normalNode() {
        const { disabled, checked, className, indeterminate, value } = this.state;
        return (
            <div className={disabled ? `${styles["tree-node-default"]} ${styles["tree-node-disabled"]} ${className}` : `${styles["tree-node-default"]} ${className}`}>
                <div className={styles["content"]}>
                    <span onClick={() => this.changeCheck()} className={indeterminate ? styles["check-box-indeterminate"] : (checked ? styles["check-box-selected"] : styles["check-box-default"])}></span>
                    {this.props.children ?? <span className={styles["folder-text-default"]}>{value}</span>}
                </div>
            </div>
        );
    }

    render() {
        const { type } = this.state;
        return (
            <>
                {type == "drop" && this.dropNode()}
                {type != "drop" && this.normalNode()}
            </>
        );
    }
}
