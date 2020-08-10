import React from 'react';
import styles from "./tree.less";
import TreeNode from './treenode.js';
import { unique } from "@/utils/array";

/**
 * 树列表
 * tree参数说明:
 *    checkedKeys: [], // 选中的选项key的数组
 *    folderKeys: [], // 折叠起来的选项key的数组
 *    isAllDisabled: false, // 是否全部不可选, 优先级最高
 *    disabledKeys: [], // 不可选的选项的key
 *    inline: false, // 表示非折叠选项的布局，true表示行内排列，默认false独占一行，优先级最高
 *    data: [] // 树列表的渲染数组
 * 渲染数组的内部参数说明:
 *    checked: true表示选中
 *    disabled: true表示不可选
 *    folder：true表示折叠选项处于折叠状态
 *    inline: true表示折叠选项的子元素布局为行内排列
 *    label: 选项的名
 *    value: 选项的key
 * 回调函数：
 *  onSwitch: 切换折叠状态后的回调: function(folderKeys){}
 *  parentChange: 全选反选后的回调: function(checkedKeys){}
 *  onChange: 点击子元素切换选中状态的回调: function(checkedKeys){}
 */
export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props;
    };

    static defaultProps = {
        checkedKeys: [], // 选中的选项key的数组
        folderKeys: [], // 折叠起来的选项key的数组
        isAllDisabled: false, // 是否全部不可选
        disabledKeys: [], // 不可选的选项的key
        inline: false, // 表示非折叠选项的布局，true表示行内排列，默认false独占一行
        data: [{
            value: 2,
            label: '产品管理',
            children: [{
                value: 500,
                label: '基础信息管理',
                children: [{
                    checked: true,
                    value: 600,
                    label: '机器人编辑'
                }, {
                    checked: true,
                    value: 700,
                    label: '参数配置'
                }, {
                    checked: true,
                    value: 800,
                    label: '转人工配置启动'
                }, {
                    checked: true,
                    value: 900,
                    label: '转人工配置'
                }]
            }, {
                value: 1000,
                label: '基础信息管理',
                children: [{
                    checked: true,
                    value: 1100,
                    label: '机器人编辑'
                }, {
                    checked: true,
                    value: 1200,
                    label: '参数配置'
                }, {
                    value: 1300,
                    label: '转人工配置启动'
                }, {
                    // disabled: true,
                    value: 1400,
                    label: '转人工配置'
                }]
            }]
        }]
    }

    componentDidUpdate(preProps, preState) {
        // 需要更改state的字段
        const changeProps = ["checkedKeys", 'folderKeys', "isAllDisabled", "disabledKeys", "inline", "data"];
        changeProps.map(item => {
            if (JSON.stringify(preProps[item]) != JSON.stringify(this.props[item])) {
                this.setState({
                    [item]: JSON.parse(JSON.stringify(this.props[item]))
                }, this.initTree);
            }
        });
    }

    componentDidMount() {
        this.initTree();
    }

    initTree() {
        const { data = [] } = this.state;
        this.setState({
            checkedKeys: this.getKeysByName('checked', data),
            folderKeys: this.getKeysByName('folder', data),
            disabledKeys: this.getKeysByName('disabled', data)
        });
    }

    /**
     * 获取嵌套数组的keyName字段值为true的所有非下拉选项的value
     * @param {*} keyName 要查的字段名
     * @param {*} arr 嵌套数组
     */
    getKeysByName = (keyName, arr = [], keys = []) => {
        arr.map(item => {
            if (item?.children?.length) {
                this.getKeysByName(keyName, item.children, keys);
            } else if (item && item[keyName]) {
                keys.push(item.value);
            }
        });
        return keys;
    }

    /**
     * 获取嵌套数组的所有非下拉选项的value
     * @param {*} arr 嵌套数组
     */
    getChildrenKeys = (arr = [], keys = []) => {
        arr.map(item => {
            if (item?.children?.length) {
                this.getChildrenKeys(item.children, keys);
            } else if (item) {
                keys.push(item.value);
            }
        });
        return keys;
    }

    // 父元素的折叠状态
    parentFolder(item) {
        let { folderKeys } = this.state;
        if (folderKeys.indexOf(item.value) > -1) {
            return 'folder';
        } else {
            return 'open';
        }
    };

    // 切换父元素折叠或打开
    switchParent(item) {
        let { folderKeys } = this.state;
        if (folderKeys.indexOf(item.value) > -1) {
            let index = folderKeys.indexOf(item.value);
            folderKeys.splice(index, 1);
        } else {
            folderKeys.push(item.value);
        }
        this.props.onSwitch && this.props.onSwitch(folderKeys);
        this.setState({
            folderKeys: folderKeys
        });
    };

    // 父元素的选中状态
    parentChecked(item) {
        const { checkedKeys = [] } = this.state;
        // 父元素所有的子元素
        let children = this.getChildrenKeys(item.children);
        // 父元素选中的子元素
        let checkedChild = [];
        children.map(sub => {
            if (checkedKeys.indexOf(sub) > -1) {
                checkedChild.push(sub);
            }
        });
        if (checkedChild.length === 0) {
            return 0;
        } else if (checkedChild.length > 0 && checkedChild.length < children.length) {
            return 1;
        } else if (checkedChild.length > 0 && checkedChild.length === children.length) {
            return 2;
        }
    };

    // 选择父元素实现全选/反选
    chooseParent(item) {
        let { checkedKeys } = this.state;
        // 当前所有子元素
        let children = this.getChildrenKeys(item.children);

        // 反选
        if (this.parentChecked(item) === 2) {
            children.map(sub => {
                if (checkedKeys.indexOf(sub) > -1) {
                    const index = checkedKeys.indexOf(sub);
                    checkedKeys.splice(index, 1);
                }
            });
            // 全选(合并后去重)
        } else {
            checkedKeys = unique([...checkedKeys, ...children]);
        }

        this.props.parentChange && this.props.parentChange(checkedKeys);
        this.setState({
            checkedKeys: checkedKeys
        });
    };

    // 父元素的禁用状态
    parentDisabled(item) {
        let { disabledKeys } = this.state;
        // 获取当前所有子元素
        let children = this.getChildrenKeys(item.children);
        // 获取当前标题下的子元素为disabled的数组
        let disabledChild = [];
        children.map(sub => {
            if (disabledKeys.indexOf(sub) > -1) {
                disabledChild.push(sub);
            }
        });

        if (disabledChild.length === 0) {
            return false;
        } else if (disabledChild.length > 0) {
            return true;
        }
    };

    // 选择子元素
    chooseChild(item) {
        let { checkedKeys = [] } = this.state;
        if (checkedKeys.indexOf(item.value) > -1) {
            let index = checkedKeys.indexOf(item.value);
            checkedKeys.splice(index, 1);
        } else {
            checkedKeys.push(item.value);
        }
        this.props.onChange && this.props.onChange(checkedKeys);
        this.setState({
            checkedKeys: checkedKeys
        });
    };

    // 子元素的选中状态
    childChecked(item) {
        const { checkedKeys = [] } = this.state;
        return checkedKeys.indexOf(item.value) > -1;
    };

    // 子元素的禁用状态
    childDisabled(item) {
        let { disabledKeys } = this.state;
        // 看是否有没有这个id
        if (disabledKeys.indexOf(item.value) > -1) {
            return true;
        } else {
            return false;
        }
    };

    render() {
        const { data = [] } = this.state;
        return (
            <ul className={styles["tree-list-box"]}>
                {this.renderTree(data)}
            </ul>
        );
    };

    renderTree(arr, num = 1) {
        return arr && arr.map((item, index) => {
            // 全局的三个属性
            const isInline = this.state.inline;
            const disabled = this.state.isAllDisabled;
            const folder = this.parentFolder(item) === 'folder' || this.state.folder;
            if (item && item.children && item.children.length > 0) {
                return (
                    <li key={item.value}>
                        <div style={{ paddingLeft: num * 10 + 'px' }} className={styles["tree-menu-title"]}>
                            <TreeNode switch={() => this.switchParent(item)} onCheck={() => this.chooseParent(item)} type="drop" folder={folder} disabled={disabled || this.parentDisabled(item)} indeterminate={this.parentChecked(item) === 1} checked={this.parentChecked(item) === 2} value={item.label} />
                        </div>
                        <ul className={folder ? styles["tree-menu-drop"] : styles["tree-menu-open-show"]}>
                            {this.renderTree(item.children, num + 1)}
                        </ul>
                    </li>
                );
            } else if (item) {
                return (
                    <li key={item.value} ref={ref => this.clickItem = ref} style={{ paddingLeft: num * 10 + 'px' }} className={isInline ? styles["tree-node-inline"] : undefined}>
                        <TreeNode onCheck={() => this.chooseChild(item)} disabled={disabled || this.childDisabled(item)} checked={this.childChecked(item)} value={item.label} />
                    </li>
                );
            }
        });
    };
}
