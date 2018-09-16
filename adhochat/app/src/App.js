import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'semantic-ui-css/semantic.min.css';
import * as constants from './core/constants.js'

import { HubConnectionBuilder } from '@aspnet/signalr'

import { Label, Segment, Menu, Header, Icon, Container, Tab, Button, Input, Modal, Form } from 'semantic-ui-react';
import { Chat } from './components/Chat';
import { InputModal } from './components/InputModal'


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
            user: { chats: [] },
            nickname: "Tuntematon",
            nick_input: "Tuntematon",
            activeChatIndex: 0
        }
        this.connection = null;
        this.sendMessage = this.sendMessage.bind(this);
        this.changeNick = this.changeNick.bind(this);
        this.messageReceived = this.messageReceived.bind(this);
        this.onReceive = this.onReceive.bind(this);
        this.newChat = this.newChat.bind(this);
        this.joinChat = this.joinChat.bind(this);
        this.updateName = this.updateName.bind(this);
    }

    changeNick(nick) {
        console.log("new nick", nick)
        const user = this.state.user;
        user.name = nick;
        this.setState({ user: user });
        axios.post("api/chat/changenick", user);
    }

    sendMessage(chatId, message) {
        const chatMessage = {
            userId: this.state.user.id,
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
        const user = this.state.user;
        const index = user.chats.findIndex(chat => chat.id == chatMessages[0].chatId);

        const chat = user.chats[index];
        if (index != this.state.activeChatIndex) {
            chat.unread = chat.unread ? (chat.unread + 1) : 1;
        }
        chat.messages = chat.messages.concat(chatMessages);

        this.setState(prevState => ({
            user: user
        }));
    }

    messageReceived(newMessages) {
        console.log(newMessages);
        this.addMessagetoChat(newMessages);
    }

    updateName(updatedUser) {
        console.log("user changed name", updatedUser)
        const user = this.state.user;
        
        const chats = user.chats
            .filter(chat => chat.users.findIndex(user => user.id == updatedUser.id) > 0);

        console.log(chats);
        chats.forEach(chat => {
            const user = chat.users.find(u => u.id == updatedUser.id);
            if (user)
                user.name = updatedUser.name;
        });
        this.setState({ user: user });
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
            case 'add_user_to_chat':
                console.log("add user to chat", message.parameters[0]);
                this.state.user.chats.find(chat => chat.id = message.parameters[0].chat.id).users.push(
                    message.parameters[0].user);
                this.forceUpdate();
                break;
            case 'user_name_change':
                this.updateName(message.parameters[0]);
                break;
            default:
                break;

        }
    }

    newChat(event) {
        axios.post("api/chat", { id: null }).then((response) => {
            const newChat = response.data;
            const user = this.state.user;
            user.chats = [...user.chats, newChat ]
            this.setState(prevState => ({
                user: user
            }));
        });
    }

    joinChat(chatId) {
        axios.post("api/chat/join/" + chatId).then(response => {
            const newChat = response.data;
            if (!this.state.user.chats.find(chat => chat.id == newChat.id)) {
                const user = this.state.user;
                user.chats = [...user.chats, newChat]
                this.setState(prevState => ({
                    user: user
                }));
            }
        });
    }

    render() {
        const chats = this.state.user.chats.map((chat, index) => {
            return {
                menuItem: <Menu.Item name={chat.title}>
                    {(chat.unread && chat.unread > 0) &&
                        <Label color='red'>{chat.unread}</Label>}
                    {chat.title}
                </Menu.Item>,
                render: () => <Tab.Pane>
                    <Chat key={chat.id} chat={chat} sendMessage={this.sendMessage} me={this.state.user}></Chat>
                </Tab.Pane>
            };
        });

        const changeNickMenu = <div>
            <Input inverted action='Change nickname' />
        </div>

        return (
            <Container fluid main>
                <Segment basic fluid inverted>
                    <Menu borderless inverted>
                        <Menu.Header as='div' style={{ height: '100%' }}
                            content={<span style={{ fontSize: '20px' }}>Adhochat</span>} />
                        <InputModal value={this.state.user ? this.state.user.name : ''}
                            position='right'
                            onSubmit={this.changeNick}
                            buttonText='Ok'
                            icon='user'
                            label='Change nick' />
                        <InputModal
                            icon='arrow circle right'
                            onSubmit={this.joinChat}
                            buttonText='Join'
                            menuLabel='Join chat'
                            label='Chat code' />
                        <Menu.Item
                            as='a'
                            name='newChat'
                            onClick={this.newChat}
                            content={<div><Icon name='plus' /> New chat</div>}
                        />
                    </Menu>
                </Segment>

                
                {chats.length > 0 ?
                    <Container style={{ paddingLeft: '10px', paddingRight: '10px' }} fluid>
                        <Tab menu={{ fluid: true, vertical: true }} panes={chats} onTabChange={
                            (event, data) => {
                                const chats = this.state.user.chats;
                                chats[data.activeIndex].unread = 0;
                                this.setState({ activeChatIndex: data.activeIndex, chats: chats });
                            }
                        } />
                    </Container>
                    : <Container textAlign='center'>
                        <Segment><Header as='h2'>Join or create a chat</Header></Segment>
                    </Container> }

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
            var userId = localStorage.getItem(constants.LOCALSTORAGE_USERID) || "";
            this.connection.invoke("Init", userId).catch(error => {
                console.log("init error", error);
            });
        });
          
    }
}

export default App;
