import React from 'react';
import "./tree.less";
import TreeNode from './treenode.js';
import { unique } from "@/utils/array";

/**
 * 树列表: 设计思路，完全由配置化数据控制行为表现(父节点的状态由子节点控制)
 * tree参数说明:
 *    checkedKeys: [], // 选中的选项key的数组
 *    folderKeys: [], // 折叠起来的选项key的数组
 *    disabledKeys: [], // 不可选的选项的key
 *    status: undefined, // 一共两对全局状态控制： checked和notChecked, disabled和notDisabled
 *    inline: false, // 表示非折叠选项的布局，true表示行内排列，默认false独占一行，优先级最高
 *    data: [] // 树列表的渲染数组
 * 回调函数：
 *  onSwitch: 切换折叠状态后的回调: function(folderKeys){ //  folderKeys为所有折叠选项  }
 *  onSelect: 点击选项的回调: function(checkedKeys, allCheckedKeys){ // checkedKeys所有选中点(不包括disabled) allCheckedKeys为所有选中项 }
 *  onChange: 选中项变化的回调: function(checkedKeys, allCheckedKeys){ // checkedKeys所有选中点(不包括disabled) allCheckedKeys为所有选中项 }
 */
export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
    };

    static defaultProps = {
        checkedKeys: [], // 选中的选项key的数组
        folderKeys: [], // 折叠起来的选项key的数组
        disabledKeys: [], // 不可选的选项的key
        status: undefined, // 一共两对全局状态控制： checked和notChecked, disabled和notDisabled
        inline: false, // 表示选项的布局，true表示行内排列，默认false独占一行
        data: [{
            value: 3,
            label: '1111',
        }, {
            value: 2,
            label: '产品管理',
            children: [{
                value: 500,
                label: '基础信息管理',
                children: [{
                    value: 600,
                    label: '机器人编辑'
                }, {
                    value: 700,
                    label: '参数配置'
                }, {
                    value: 800,
                    label: '转人工配置启动'
                }, {
                    value: 900,
                    label: '转人工配置'
                }]
            }, {
                value: 1000,
                label: '基础信息管理',
                children: [{
                    value: 1100,
                    label: '机器人编辑',
                    children: [{
                        value: 1200,
                        label: '机器人编辑',
                    }]
                }, {
                    value: 1300,
                    label: '参数配置'
                }, {
                    value: 1400,
                    label: '转人工配置启动'
                }, {
                    value: 1500,
                    label: '转人工配置'
                }]
            }]
        }]
    }

    componentDidMount() {
        this.initTree();
    }

    componentDidUpdate(preProps, preState) {
        // 需要更新state的字段
        const changeProps = ["checkedKeys", 'folderKeys', "disabledKeys", "status", "inline", "data"];
        changeProps.map(item => {
            if (preProps[item]?.toString() != this.props[item]?.toString()) {
                this.initTree();
            }
        });
    }

    initTree() {
        const { checkedKeys = [], folderKeys = [], disabledKeys = [], status, inline, data = [] } = this.props;

        let checkedKeys_result = [...checkedKeys];
        let folderKeys_result = [...folderKeys];
        let disabledKeys_result = [...disabledKeys];
        const allChild = this.getChildrenKeys(data);

        // 全选(忽略disabled选项)
        if (status == "checked") {
            const filterDisabled = this.filterArray(allChild, disabledKeys_result);
            checkedKeys_result = [...checkedKeys_result, ...filterDisabled];
            // 反选(忽略disabled选项)
        } else if (status == "notChecked") {
            checkedKeys_result = checkedKeys_result.filter(sub => { return disabledKeys_result.indexOf(sub) > -1; });
            // 全部禁用
        } else if (status == "disabled") {
            disabledKeys_result = allChild;
            // 全部不禁用
        } else if (status == "notDisabled") {
            disabledKeys_result = [];
        }

        // 合并
        this.setState({
            checkedKeys: unique(checkedKeys_result),
            folderKeys: unique(folderKeys_result),
            disabledKeys: unique(disabledKeys_result),
            inline: inline
        });

        this.props.onChange && this.props.onChange(unique(this.filterArray(checkedKeys_result, disabledKeys_result)), this.props.checkedKeys);
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

    // keys数组过滤掉filters数组中存在的元素
    filterArray = (keys = [], filters = []) => {
        return keys.filter(sub => { return filters.indexOf(sub) == -1; });
    }

    // 父元素的折叠状态
    parentFolder(item) {
        let { folderKeys = [] } = this.state;
        if (folderKeys.indexOf(item.value) > -1) {
            return 'folder';
        } else {
            return 'open';
        }
    };

    // 切换父元素折叠或打开
    switchParent(item) {
        let { folderKeys = [] } = this.state;
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
        const { checkedKeys = [], disabledKeys = [] } = this.state;
        // 父元素所有的子元素
        const children = this.getChildrenKeys(item.children);
        // 过滤禁用子元素
        const filterDisabled = this.filterArray(children, disabledKeys);
        // 选中状态参考的对象：全部子元素或可点击子元素
        let finallyChild = filterDisabled?.length ? filterDisabled : children;
        // 父元素选中的子元素
        let checkedChild = [];
        finallyChild.map(sub => {
            if (checkedKeys.indexOf(sub) > -1) {
                checkedChild.push(sub);
            }
        });
        if (checkedChild.length === 0) {
            return 'none';
        } else if (checkedChild.length > 0 && checkedChild.length < finallyChild.length) {
            return 'indeterminate';
        } else if (checkedChild.length > 0 && checkedChild.length === finallyChild.length) {
            return "checked";
        }
    };

    // 选择父元素实现全选/反选
    chooseParent(item) {
        let { checkedKeys = [], disabledKeys = [] } = this.state;
        // 当前所有子元素
        let children = this.getChildrenKeys(item.children);
        // 过滤禁用子元素
        let filterDisabled = this.filterArray(children, disabledKeys);
        // 所有选中的元素
        let result = [];
        // 当前全选/反选的元素
        let current = [];
        // 反选
        if (this.parentChecked(item) === "checked") {
            result = this.filterArray(checkedKeys, filterDisabled);
            current = filterDisabled.filter(sub => { return checkedKeys.indexOf(sub) > -1; });
            // 全选
        } else {
            current = this.filterArray(filterDisabled, checkedKeys);
            result = [...checkedKeys, ...current];
        }
        this.setState({
            checkedKeys: result
        });

        // 回调
        this.props.onSelect && this.props.onSelect(this.filterArray(result, disabledKeys), result);
        this.props.onChange && this.props.onChange(this.filterArray(result, disabledKeys), result);
    };

    // 父元素的禁用状态
    parentDisabled(item) {
        let { disabledKeys = [] } = this.state;
        // 获取当前所有子元素
        let children = this.getChildrenKeys(item.children);
        // 获取当前标题下的子元素为disabled的数组
        let disabledChild = [];
        children.map(sub => {
            if (disabledKeys.indexOf(sub) > -1) {
                disabledChild.push(sub);
            }
        });

        if (disabledChild.length === children.length) {
            return true;
        } else {
            return false;
        }
    };

    // 选择子元素
    chooseChild(item) {
        let { checkedKeys = [], disabledKeys = [] } = this.state;
        if (checkedKeys.indexOf(item.value) > -1) {
            let index = checkedKeys.indexOf(item.value);
            checkedKeys.splice(index, 1);
        } else {
            checkedKeys.push(item.value);
        }
        this.setState({
            checkedKeys: checkedKeys
        });

        // 回调
        this.props.onSelect && this.props.onSelect(this.filterArray(checkedKeys, disabledKeys), checkedKeys);
        this.props.onChange && this.props.onChange(this.filterArray(checkedKeys, disabledKeys), checkedKeys);
    };

    // 子元素的选中状态
    childChecked(item) {
        const { checkedKeys = [] } = this.state;
        return checkedKeys.indexOf(item.value) > -1;
    };

    // 子元素的禁用状态
    childDisabled(item) {
        let { disabledKeys = [] } = this.state;
        return disabledKeys.indexOf(item.value) > -1;
    };

    render() {
        const { data = [] } = this.props;
        return (
            <ul className="tree-list-box">
                {this.renderTree(data)}
            </ul>
        );
    };

    renderTree(arr, num = 1) {
        const { inline } = this.state;
        return arr && arr.map((item, index) => {
            if (item && item.children && item.children.length > 0) {
                return (
                    <li key={item.value}>
                        <div className="tree-menu-title">
                            <TreeNode switch={() => this.switchParent(item)} onCheck={() => this.chooseParent(item)} type="drop" folder={this.parentFolder(item) === 'folder'} disabled={this.parentDisabled(item)} indeterminate={this.parentChecked(item) === "indeterminate"} checked={this.parentChecked(item) === "checked"}>{item.label}</TreeNode>
                        </div>
                        <ul style={{ paddingLeft: 13 + 'px' }} className={this.parentFolder(item) === 'folder' ? "tree-menu-drop" : "tree-menu-open-show"}>
                            {this.renderTree(item.children, num + 1)}
                        </ul>
                    </li>
                );
            } else if (item) {
                return (
                    <li key={item.value} ref={ref => this.clickItem = ref} className={inline ? "tree-node-inline" : undefined}>
                        <TreeNode onCheck={() => this.chooseChild(item)} disabled={this.childDisabled(item)} checked={this.childChecked(item)}>{item.label}</TreeNode>
                    </li>
                );
            }
        });
    };
}
