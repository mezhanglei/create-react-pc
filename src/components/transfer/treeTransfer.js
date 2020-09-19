
import styles from "./treeTransfer.less";
import Tree from "@/components/tree/tree";
import TreeNode from "@/components/tree/treenode";
import { Input } from "antd";
import { unique } from "@/utils/array";
import Result from "@/components/result/result";
import { regQuery } from "@/utils/array";
import Button from "@/components/button/index";

/**
 * 树形穿梭框
 * 参数说明：
 * checkedKeys: [], // 选中的选项key的数组
 * folderKeys: [], // 折叠起来的选项key的数组
 * disabledKeys: [], // 不可选的选项的key
 * status: undefined, // 一共两对全局状态控制： checked和notChecked, disabled和notDisabled
 * inline: false, // 表示选项的布局，true表示行内排列，默认false独占一行
 * data: [] // 渲染树列表的数据
 * 
 */
export default class TreeTransfer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
    }

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
                    label: '机器人编辑',
                    children: [{
                        checked: true,
                        disabled: true,
                        value: 11033,
                        label: '机器人编辑',
                    }]
                }, {
                    disabled: true,
                    checked: true,
                    value: 1200,
                    label: '参数配置'
                }, {
                    value: 1300,
                    label: '转人工配置启动',
                    disabled: true,
                }, {
                    disabled: true,
                    checked: true,
                    value: 1400,
                    label: '转人工配置'
                }]
            }]
        }]
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

    componentDidMount() {
        this.initTree();
    }

    // 初始化树
    initTree() {
        const { checkedKeys = [], folderKeys = [], disabledKeys = [], status, inline, data = [] } = this.props;
        this.setState({
            checkedKeys,
            folderKeys,
            disabledKeys,
            status,
            inline,
            data,
            list: this.getChildrenList(data)
        });
    }

    // 左边选项，全选/反选
    switchLeft = (checked) => {
        if (checked) {
            this.setState({
                status: "checked"
            });
        } else {
            this.setState({
                status: "notChecked"
            });
        }
    }

    // 右侧全选/反选
    switchRight = (checked) => {
        const { targetKeys = [] } = this.state;
        if (checked) {
            this.setState({
                targetSelectedKeys: [...targetKeys]
            });
        } else {
            this.setState({
                targetSelectedKeys: []
            });
        }
    }

    /**
     * 树列表展开成一维数组
     * @param {*} arr 嵌套数组
     */
    getChildrenList = (arr = [], list = []) => {
        arr.map(item => {
            if (item?.children?.length) {
                this.getChildrenList(item.children, list);
            } else if (item) {
                list.push(item);
            }
        });
        return list;
    }

    // 根据keys获取对应的元素
    getListByKeys = (keys = []) => {
        const { list = [] } = this.state;
        return list.filter(item => { return keys.indexOf(item.value) > -1; });
    }

    handleChangeLeft = (checkedKeys) => {
        this.setState({
            sourceSelectedKeys: checkedKeys
        });
    }


    // 右侧选择选项
    handleSelectRight = (item, checked) => {
        let { targetSelectedKeys = [] } = this.state;
        if (checked) {
            targetSelectedKeys.push(item.value);
        } else {
            let index = targetSelectedKeys.indexOf(item.value);
            targetSelectedKeys.splice(index, 1);
        }
        this.setState({
            targetSelectedKeys: targetSelectedKeys
        });
    }

    rightEle = () => {
        const { targetKeys = [], targetSelectedKeys = [] } = this.state;
        const list = this.getListByKeys(targetKeys);
        return (
            <div className={styles["show-list"]}>
                {
                    list.map((item, index) => {
                        return (
                            <div key={index} className={styles["list-item"]}>
                                <TreeNode checked={targetSelectedKeys.indexOf(item.value) > -1} onCheck={(checked) => this.handleSelectRight(item, checked)} />
                                {item.label}
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    // 向右添加
    toRight = () => {
        const { sourceSelectedKeys = [], targetKeys = [], disabledKeys = [] } = this.state;
        if (sourceSelectedKeys?.length) {
            // 左边的禁止点击，右边的添加
            this.setState({
                disabledKeys: unique([...disabledKeys, ...sourceSelectedKeys]),
                targetKeys: unique([...targetKeys, ...sourceSelectedKeys]),
                allLeft: false
            }, () => {
                this.props.toRight && this.props.toRight(sourceSelectedKeys, targetKeys);
                this.setState({
                    sourceSelectedKeys: []
                });
            });
        }
    }

    // 向左添加
    toLeft = () => {
        const { targetSelectedKeys = [], targetKeys = [], disabledKeys = [] } = this.state;
        if (targetSelectedKeys?.length) {
            // 右边选择的删除，然后左边的对应位置恢复点击
            this.setState({
                targetKeys: targetKeys.filter(sub => { return targetSelectedKeys.indexOf(sub) == -1; }),
                disabledKeys: disabledKeys.filter(sub => { return targetSelectedKeys.indexOf(sub) == -1; }),
                allRight: false
            }, () => {
                this.props.toLeft && this.props.toLeft(targetSelectedKeys, targetKeys);
                this.setState({
                    targetSelectedKeys: []
                });
            });
        }
    }

    render() {
        const { targetKeys = [], sourceSelectedKeys = [], targetSelectedKeys = [], checkedKeys = [], folderKeys = [], disabledKeys = [], status, inline, data = [] } = this.state;
        // 树列表的props
        const treeProps = {
            checkedKeys: unique([...checkedKeys, ...targetSelectedKeys]),
            folderKeys: folderKeys,
            disabledKeys: disabledKeys,
            status: status,
            inline: inline,
            data: data
        };
        return (
            <div className={styles["tree-transfer"]}>
                <div className={styles["transfer-base"]}>
                    <div className={styles["transfer-list-header"]}>
                        <TreeNode checked={this.state.allLeft} onCheck={this.switchLeft} value="全选/反选" />
                    </div>
                    <div className={styles["transfer-list-body"]}>
                        <div className={styles['body-search']}>
                        </div>
                        <div className={styles["body-content"]}>
                            <Tree key="left" {...treeProps} onChange={this.handleChangeLeft} />
                        </div>
                    </div>
                    <div className={styles["transfer-list-footer"]}>
                        {this.props.footer}
                    </div>
                </div>
                <div className={styles["transfer-middle"]}>
                    <Button disabled={!sourceSelectedKeys?.length} onClick={this.toRight} className={styles['to-right']}>
                        right
                    </Button>
                    <Button disabled={!targetSelectedKeys?.length} onClick={this.toLeft} className={styles['to-left']}>
                        left
                    </Button>
                </div>
                <div className={styles["transfer-base"]}>
                    <div className={styles["transfer-list-header"]}>
                        <TreeNode checked={this.state.allRight} onCheck={this.switchRight} value="全选/反选" />
                    </div>
                    <div className={styles["transfer-list-body"]}>
                        <div className={styles["body-content"]}>
                            {targetKeys?.length ? this.rightEle() : ""}
                        </div>
                    </div>
                    <div className={styles["transfer-list-footer"]}>
                        {this.props.footer}
                    </div>
                </div>
            </div>
        );
    }
}
