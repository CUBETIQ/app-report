import React from 'react';
import {Layout} from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
} from '@ant-design/icons';
import styled from "styled-components";
import MenuSider from "./MenuSider";
import DrawerMenu from "./DrawerMenu";

const Title = styled.span`
    padding-left: 20px;
    
    @media (max-width: 720px){
        display: none;
    }
`;

const {Header, Sider, Content} = Layout;

const Height = {
    height: "100vh"
}

class MainLayout extends React.Component<any, any> {
    state = {
        collapsed: false,
        visible: false
    };

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    onClose = (visible: boolean) => {
        this.setState({visible: visible})
    }

    render() {
        return (
            <Layout style={Height}>
                <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
                    <div className="logo">
                        <h1 style={{textAlign: "center", color: "#fff"}}>Main Report</h1>
                    </div>
                    <MenuSider/>
                </Sider>
                <Layout className="site-layout">
                    <Header className="site-layout-background" style={{paddingLeft: 15}}>
                        <span id="icon-drawer-big">
                            {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                className: 'trigger',
                                onClick: this.toggle,
                            })}
                        </span>

                        <span id="icon-drawer-small" onClick={() => this.setState({visible: true})}>
                            <MenuUnfoldOutlined/>
                        </span>

                        <Title> Report Management</Title>
                    </Header>
                    <Content
                        // className="site-layout-background"
                        style={{
                            margin: '24px 16px',
                            padding: 24,
                            minHeight: 280,
                        }}
                    >{this.props.children}
                        <DrawerMenu visible={this.state.visible} onClose={this.onClose}/>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default MainLayout;