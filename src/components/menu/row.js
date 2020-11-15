import './row.less';

/**
 * 横向导航demo
 */
class RowMenu extends React.Component {
    constructor(props) {
        super(props);
        // 子菜单列表
        this.childrenMenu = {};
        this.state = {
            // 下拉菜单的偏移距离
            instance: {}
        };
    }

    static defaultProps = {
        menuData: [{
            id: 1,
            name: '首页',
            url: '/'
        }, {
            id: 2,
            name: '关于我们',
            url: '/',
            children: [{
                id: 12,
                name: '其他1',
                url: '/111111',
            }, {
                id: 13,
                name: '其他2',
                url: '/1111333',
            }]
        }, {
            id: 3,
            name: '个人中心',
            url: '/'
        }]
    }

    componentDidMount = async () => {
        this.countNav();
        window.addEventListener('resize', this.countNav, false);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.countNav, false);
    }

    countNav = () => {
        // 计算下拉菜单的位置
        setTimeout(() => {
            if (this.navRef.children) {
                let keys = Object.keys(this.navRef.children);
                let minLeft = this.navRef.getBoundingClientRect().left;
                keys.map((item) => {
                    let { instance } = this.state;
                    const children = this.navRef.children[item];
                    const childrenMenu = this.childrenMenu[item];
                    const halfChildrenMenu = childrenMenu && (childrenMenu.offsetWidth / 2);
                    const childrenLeft = children.getBoundingClientRect().left;
                    const childrenWidth = children && (children.offsetWidth);
                    const leftMargin = childrenLeft - halfChildrenMenu + childrenWidth;
                    let result = leftMargin < minLeft ? minLeft : leftMargin;
                    instance[item] = result;
                    this.setState({
                        instance
                    });
                });
            }
        }, 0);
    }


    // 一级带下拉的选项
    menuTree = (item, index) => {
        // 下拉菜单左边偏移量

        return (
            <li key={index} className={this.chooseRule(item, index) ? 'underline top-list-li' : 'top-list-li'}>
                <div className='pointer'>
                    <span>{item.name}</span>
                    <img className='down-icon' src={require('static/images/select-down.png')} alt="" />
                </div>
                <div className='nav-bottom-list'>
                    <ul ref={node => this.childrenMenu[index] = node} style={{ marginLeft: this.state.instance[index] + 'px' }} className='second-menu'>
                        {
                            item.children && item.children.map((sub, num) => {
                                return this.secondMenu(sub, num, item);
                            })
                        }
                    </ul>
                </div>
            </li>
        );
    }

    // 一级不带下拉的选项
    menuItem = (item, index) => {
        return (
            <li key={index} className={this.chooseRule(item, index) ? 'underline top-list-li' : 'top-list-li'}>
                <div onClick={(e) => { this.onClick(item); }} className='pointer'>
                    <span>{item.name}</span>
                </div>
            </li>
        );
    }

    // 二级选项
    secondMenu = (sub, num, parent) => {
        return (
            <li key={num} className='second-menu-li'>
                <div className='pointer'>
                    <span onClick={(e) => { this.onClick(sub, parent); }}>{sub.name}</span>
                    {sub.children && sub.children.length && <img className='down-icon' src={require('static/images/select-down.png')} alt="" />}
                </div>
            </li>
        );
    }

    // 点击选项的回调函数
    onClick = (item, parent) => {
        this.setState({
            currentId: item.id
        });
        this.props.onClick && this.props.onClick(item, parent);
    }

    // 当前导航选中的规则，return true表示选中
    chooseRule = (item) => {
        if (item.id == this.state.currentId) {
            return true;
        } else {
            return this.props.chooseRule && this.props.chooseRule(item);
        }
    }

    render() {
        const { menuData = [] } = this.props;

        return (
            <div className='menu-outside'>
                <div className='menu-outside-fixed'>
                    <div className='menu-container'>
                        <div className='navLeft'>
                            <ul ref={node => this.navRef = node} className='menu'>
                                {
                                    menuData.map((item, index) => {
                                        if (item && item.children && item.children.length) {
                                            return this.menuTree(item, index);
                                        } else {
                                            return this.menuItem(item, index);
                                        }
                                    })
                                }
                            </ul>
                        </div>
                        <div className='navRight'>
                            {this.props.right}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default RowMenu;
