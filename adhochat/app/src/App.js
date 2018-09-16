import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'semantic-ui-css/semantic.min.css';
import * as constants from './core/constants.js'

import { HubConnectionBuilder } from '@aspnet/signalr'

import { Sidebar, Segment, Menu, Header, Icon, Container, Tab, Button, Input, Modal, Form } from 'semantic-ui-react';
import { Chat } from './components/Chat';


import axios from 'axios'
axios.interceptors.request.use(function (config) {
    var userId = localStorage.getItem(constants.LOCALSTORAGE_USERID);
    if (userId)
        config.headers[constants.HEADER_USERID] = userId;
    return config;
});

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: "",
            nickname: "Tuntematon",
            nick_input: "Tuntematon",
            chats: [],
            joinChatValue: "",
            showJoinChatModal: false
        }
        this.connection = null;
        this.sendMessage = this.sendMessage.bind(this);
        this.changeNickname = this.changeNickname.bind(this);
        this.nickChange = this.nickChange.bind(this);
        this.messageReceived = this.messageReceived.bind(this);
        this.onReceive = this.onReceive.bind(this);
        this.newChat = this.newChat.bind(this);
        this.joinChat = this.joinChat.bind(this);
    }

    changeNickname(event) {
        this.setState(prevState => ({
            nickname: prevState.nick_input
        }));
        event.preventDefault();
    }

    sendMessage(chatId, message) {
        const chatMessage = {
            senderId: this.state.user.id,
            content: message,
            chatId: chatId
        };

        this.addMessagetoChat(chatMessage);
      
        this.connection.invoke("SendMessage", chatMessage).catch(function (error) {
            console.log(error);
        });
    }

    addMessagetoChat(chatMessages) {
        if (!Array.isArray(chatMessages))
            chatMessages = [chatMessages];

        console.log("chatMessages", chatMessages);
        const chats = this.state.chats;
        const chat = chats.find(chat => chat.id == chatMessages[0].chatId);
        chat.messages = chat.messages.concat(chatMessages);

        this.setState(prevState => ({
            chats: chats
        }));
    }

    nickChange(event) {
        this.setState({ nick_input: event.target.value });
    }

    messageReceived(newMessages) {
        console.log(newMessages);
        this.addMessagetoChat(newMessages);
    }



    onReceive(message) {
        console.log("received", message);
        switch (message.command) {
            case 'msg':
                this.messageReceived(message.parameters)
                break;
            case 'set_user':
                console.log("user", message.parameters[0]);
                localStorage.setItem(constants.LOCALSTORAGE_USERID, message.parameters[0].id);
                this.setState({ user: message.parameters[0] })
                break;
            default:
                break;

        }
    }

    newChat(event) {
        axios.post("api/chat", { id: null }).then((response) => {
            const newChat = response.data;
            this.setState(prevState => ({
                chats: [...prevState.chats, newChat]
            }));
        });
    }

    joinChat(event) {
        event.preventDefault();
        axios.post("api/chat/join/" + this.state.joinChatValue).then(response => {
            const newChat = response.data;
            this.setState(prevState => ({
                joinChatValue: '',
                showJoinChatModal: false,
                chats: [...prevState.chats, newChat]
            }));
        });
    }

    render() {
        const chats = this.state.chats.map((chat, index) => {
            return {
                menuItem: chat.title,
                render: () => <Tab.Pane>
                    <Chat key={chat.id} chat={chat} sendMessage={this.sendMessage}></Chat>
                </Tab.Pane>
            };
        });

        const changeNickMenu = <div>
            <Input inverted action='Change nickname' />
        </div>

        const joinModal = <Modal open={this.state.showJoinChatModal} size='tiny'
            onClose={() => { this.setState({ showJoinChatModal: false }); }}
            trigger={<Menu.Item
            as='a'
            name='joinChat'
            onClick={() => { this.setState({ showJoinChatModal: true }); }}
            content={<div><Icon name='arrow circle right' /> Join chat</div>}
        />}>
            <Modal.Header>Enter chat code</Modal.Header>
            <Modal.Content>
                <Form onSubmit={this.joinChat} >
                    <Form.Input value={this.state.joinChatValue}
                        onChange={(e) => { this.setState({ joinChatValue: e.target.value }) }}
                        fluid action={<Button type='submit' primary onClick={this.joinChat} > Join</Button>} />
                </Form>
            </Modal.Content>
        </Modal>

        return (
            <Container fluid main>
                <Segment basic fluid inverted>
                    <Menu borderless inverted>
                        <Menu.Header as='div' style={{ height: '100%' }}
                            content={<span style={{ fontSize: '20px' }}>Adhochat</span>} />
                        <Menu.Item position='right'
                            as='a'
                            name='changeNick'
                            content={<div><Icon name='user circle' /> Change nick</div>}
                        />
                        {joinModal}
                        <Menu.Item
                            as='a'
                            name='newChat'
                            onClick={this.newChat}
                            content={<div><Icon name='plus' /> New chat</div>}
                        />
                    </Menu>
                </Segment>

                {chats.length > 0 ?
                    <Container fluid><Tab menu={{ fluid: true, vertical: true }} panes={chats} /></Container>
                    : <Container textAlign='center'><Segment><Header as='h2'>Join or create a chat</Header></Segment></Container>}

            </Container>
        );
    }

    componentDidMount() {
        this.connection = new HubConnectionBuilder().withUrl("/hub/chat").build();
        this.connection.on("adhc_msg", this.onReceive)
        this.connection.start().catch(error => {
            console.log(error);
        }).then(() => {
            console.log("ok");
            var user = localStorage.getItem(constants.LOCALSTORAGE_USERID) || { id: "" };
            this.connection.invoke("Init", user.id).catch(error => {
                console.log("init error", error);
            });
        });
          
    }
}

export default App;
