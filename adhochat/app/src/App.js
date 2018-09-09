import React from 'react';
import logo from './logo.svg';
import './App.css';

import * as constants from './core/constants.js'

import { HubConnectionBuilder } from '@aspnet/signalr'

import { Sidebar, Segment, Menu, Header, Icon, Container } from 'semantic-ui-react';
import { Chat } from './components/Chat';


import axios from 'axios'
axios.interceptors.request.use(function (config) {
    console.log(config);
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
            chats: []
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
        const chatId = event.target.chatId.value;

        axios.post("api/chat/join/" + chatId).then(response => {
            const newChat = response.data;
            this.setState(prevState => ({
                chats: [...prevState.chats, newChat]
            }));
        });
        event.preventDefault();
    }

    render() {
        console.log(this.state)
        const chats = this.state.chats.map((chat, index) =>
            <Chat key={chat.id} chat={chat} sendMessage={this.sendMessage}></Chat>);
        


        return (
            <div>
                <Sidebar.Pushable as={Segment}>
                    <Sidebar as={Menu} animation='overlay' icon='labeled' inverted vertical visible width='thin'>
                        <Menu.Item as='a'>
                            <Icon name='home' />
                            Home
                    </Menu.Item>
                        <Menu.Item as='a'>
                            <Icon name='gamepad' />
                            Games
                    </Menu.Item>
                        <Menu.Item as='a'>
                            <Icon name='camera' />
                            Channels
                     </Menu.Item>
                    </Sidebar>


                </Sidebar.Pushable>

                <Container main>
                    <Header as='h2'>Adhochat</Header>

                    <button type="button" onClick={this.newChat}>+ New Chat</button>

                    {chats}

                    <form onSubmit={this.joinChat}>
                        <label>Join chat: </label>
                        <input type="text" name="chatId" />
                        <input type="submit" value="Join" />
                    </form>

                </Container>
            </div>
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
