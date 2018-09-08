import React, { Component } from 'react';
import Axios from 'axios'
import logo from './logo.svg';
import './App.css';

import { HubConnectionBuilder } from '@aspnet/signalr'

import { Sidebar, Segment, Menu, Header, Icon, Container } from 'semantic-ui-react';
import { ChatMessage } from './components/ChatMessage'
import { MessageInput } from './components/MessageInput'

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: "",
            nickname: "Tuntematon",
            nick_input: "Tuntematon",
            messages: []
        }
        this.connection = null;
        this.sendMessage = this.sendMessage.bind(this);
        this.changeNickname = this.changeNickname.bind(this);
        this.nickChange = this.nickChange.bind(this);
        this.messageReceived = this.messageReceived.bind(this);
        this.onReceive = this.onReceive.bind(this);
    }

    changeNickname(event) {
        this.setState(prevState => ({
            nickname: prevState.nick_input
        }));
        event.preventDefault();
    }

    sendMessage(message) {
        const chatMessage = {
            senderId: this.state.user.id,
            content: message,
            chatId: 'geh'
        };

        this.setState(prevState => ({
            messages: [...prevState.messages, chatMessage]
        }));
        this.connection.invoke("SendMessage", chatMessage).catch(function (error) {
            console.log(error);
        });
    }

    nickChange(event) {
        this.setState({ nick_input: event.target.value });
    }

    messageReceived(newMessages) {
        this.setState(prevState => ({
            messages: [...prevState.messages, newMessages]
        }));
    }

    onReceive(message) {
        console.log(message);
        switch (message.command) {
            case 'msg':
                this.messageReceived(message.parameters)
                break;
            case 'set_user':
                localStorage.setItem("adchohat_user", message.parameters[0]);
                this.setState({ user: message.parameters[0] })
                break;
            default:
                break;

        }
    }

    render() {
        const messageList = this.state.messages.map((message, index) =>
            <ChatMessage key={index} message={message.content}></ChatMessage>);

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
                    <ul>
                        {messageList}
                    </ul>
                    <MessageInput onNewMessage={this.sendMessage}></MessageInput>

                    <br />

                    <form onSubmit={this.changeNickname}>
                        <label>Nickname: </label>
                        <input type="text" value={this.state.nick_input} name="nickname" onChange={this.nickChange} />
                    </form>

                </Container>
            </div>
        );
    }

    componentDidMount() {
        Axios.get("api/test/test").then(response => {
            this.setState({ test: response.data });
            this.connection = new HubConnectionBuilder().withUrl("/chat").build();

            this.connection.on("adhc_msg", this.onReceive)
            this.connection.start().catch(error => {
                console.log(error);
            }).then(() => {
                console.log("ok");
                var user = localStorage.getItem("adhochat_user") || { id: "" };
                this.connection.invoke("Init", user.id).catch(error => {
                    console.log("init error", error);
                });
            });
          
        });
    }
}

export default App;
