import React, { Component } from 'react';
import Board from './components/Board';
import './game.css'
import ReactDOM from 'react-dom';

class Game extends Component {
    state = {
        height: 8,
        width: 8,
        mines: 10
    };

    render() {
        const { height, width, mines } = this.state;
        return (
            <div className="game">
                <Board height={height} width={width} mines={mines} />
            </div>
        )
    }
}

ReactDOM.render(<Game />, document.getElementById("root"));