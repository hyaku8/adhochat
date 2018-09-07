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
            nickname: "Tuntematon",
            nick_input: "Tuntematon",
            messages: []
        }
        this.connection = null;
        this.sendMessage = this.sendMessage.bind(this);
        this.changeNickname = this.changeNickname.bind(this);
        this.nickChange = this.nickChange.bind(this);
        this.messageReceived = this.messageReceived.bind(this);
    }

    changeNickname(event) {
        this.setState(prevState => ({
            nickname: prevState.nick_input
        }));
        event.preventDefault();
    }

    sendMessage(message) {
        this.setState(prevState => ({
            messages: [...prevState.messages, { user: prevState.nickname, content: message }]
        }));
        this.connection.invoke("SendMessage", this.state.nickname, message).catch(function (error) {
            console.log(error);
        });
    }

    nickChange(event) {
        this.setState({ nick_input: event.target.value });
    }

    messageReceived(user, message) {
        this.setState(prevState => ({
            messages: [...prevState.messages, {user: user, content: message}]
        }));
    }

    
    render() {

        const messageList = this.state.messages.map((message, index) =>
            <ChatMessage key={index} message={message}></ChatMessage>);

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
            this.connection.on("msg", this.messageReceived);
            this.connection.start().catch(error => {
                console.log(error);
            });
        });
    }
}

export default App;
