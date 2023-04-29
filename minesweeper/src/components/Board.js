import React, { Component } from 'react';
import Cell from './Cell'
import PropTypes from 'prop-types';

export default class Board extends Component {
    state = {
        boardData: this.initBoardData(this.props.height, this.props.width, this.props.mines),
        gameStatus: "Game in progress",
        mineCount: this.props.mines,
        firstMoveMade: false,
        gameFinished: false
    };

    getMines(data) {
        let mineArray = [];

        data.forEach(datarow => {
            datarow.forEach((dataitem) => {
                if (dataitem.isMine) {
                    mineArray.push(dataitem);
                }
            })
        })

        return mineArray;
    }

    getFlags(data) {
        let flagArray = [];

        data.forEach(datarow => {
            datarow.forEach((dataitem) => {
                if (dataitem.isFlagged) {
                    flagArray.push(dataitem);
                }
            })
        })

        return flagArray;
    }

    getHidden(data) {
        let hiddenArray = [];

        data.forEach(datarow => {
            datarow.forEach((dataitem) => {
                if (dataitem.isRevealed) {
                    hiddenArray.push(dataitem);
                }
            })
        })

        return hiddenArray;
    }

    getRandomNumber(dimension) {
        // return Math.floor(Math.random() * dimension);
        return Math.floor((Math.random() * 1000) + 1) % dimension;
    }

    initBoardData(height, width, mines) {
        let data = this.createEmptyArray(height, width);
        data = this.plantMines(data, height, width, mines);
        data = this.getNeighbors(data, height, width);
        return data;
    }

    createEmptyArray(height, width) {
        let data = [];
        for (let i = 0; i < height; i++) {
            data.push([]);
            for (let j = 0; j < width; j++) {
                data[i][j] = {
                    x: i,
                    y: j,
                    isMine: false,
                    neighbor: 0,
                    isRevealed: false,
                    isEmpty: false,
                    isFlagged: false,
                };
            }
        }
        return data;
    }

    plantMines(data, height, width, mines) {
        let randomx, randomy, minesPlanted = 0;

        while (minesPlanted < mines) {
            randomx = this.getRandomNumber(width);
            randomy = this.getRandomNumber(height);

            if (!(data[randomx][randomy].isMine)) {
                data[randomx][randomy].isMine = true;
                minesPlanted++;
            }
        }
        return (data);
    }

    getNeighboringCells(x, y, data) {
        const neighbors = [];
        
        if (x > 0) {
            neighbors.push(data[x-1][y]);
        }

        if (x < this.props.height - 1) {
            neighbors.push(data[x+1][y]);
        }

        if (y > 0) {
            neighbors.push(data[x][y-1]);
        }

        if (y < this.props.width - 1) {
            neighbors.push(data[x][y+1]);
        }

        if (x > 0 && y > 0) {
            neighbors.push(data[x-1][y-1]);
        }

        if (x > 0 && y < this.props.width - 1) {
            neighbors.push(data[x-1][y+1]);
        }

        if (x < this.props.height - 1 && y < this.props.width - 1) {
            neighbors.push(data[x+1][y+1]);
        }

        if (x < this.props.height - 1 && y > 0) {
            neighbors.push(data[x+1][y-1]);
        }

        return neighbors;
    }

    getNeighbors(data, height, width) {
        let updatedData = data;

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (data[i][j].isMine !== true) {
                    let mine = 0;
                    const area = this.getNeighboringCells(data[i][j].x, data[i][j].y, data);
                    area.forEach(value => {
                        if (value.isMine) {
                            mine++;
                        }
                    });
                    if (mine === 0) {
                        updatedData[i][j].isEmpty = true;
                    }
                    updatedData[i][j].neighbor = mine;
                }
            }
        }

        return (updatedData);
    }

    revealBoard() {
        let updatedData = this.state.boardData;
        updatedData.forEach((datarow) => {
            datarow.forEach((dataitem) => {
            dataitem.isRevealed = true;
            });
        });
        this.setState({
            boardData: updatedData
        })
    }

    revealEmpty(x, y, data) {
        let area = this.getNeighboringCells(x, y, data);
        area.map(value => {
          if (!value.isFlagged && !value.isRevealed && (value.isEmpty || !value.isMine)) {
            data[value.x][value.y].isRevealed = true;
            if (value.isEmpty) {
              this.revealEmpty(value.x, value.y, data);
            }
          }
        });
        
        return data;
    
    }

    handleCellClick(x, y) {
        if (this.state.boardData[x][y].isRevealed || this.state.boardData[x][y].isFlagged) return null;

        if (this.state.boardData[x][y].isMine) {
            if (this.state.firstMoveMade) {
                this.setState({gameStatus: "You Lost.", gameFinished: true});
                this.revealBoard();

            } else {
                while (this.state.boardData[x][y].isMine) {
                    this.state.boardData = this.initBoardData();
                }
            }
        }

        this.state.firstMoveMade = true;

        let updatedData = this.state.boardData;
        updatedData[x][y].isFlagged = false;
        updatedData[x][y].isRevealed = true;

        if (updatedData[x][y].isEmpty) {
            updatedData = this.revealEmpty(x, y, updatedData);
          }

        if (this.getHidden(updatedData).length === this.props.mines) {
            this.setState({gameStatus: "You Win", gameFinished: true});
            this.revealBoard();
        }

        this.setState({
            boardData: updatedData,
            mineCount: this.props.mines - this.getFlags(updatedData).length,
        });
    }

    handleContextMenu(event, x, y) {
        event.preventDefault();
        let updatedData = this.state.boardData;
        let mines = this.state.mineCount;

        if (updatedData[x][y].isRevealed) return;
        if (updatedData[x][y].isFlagged) {
            updatedData[x][y].isFlagged = false;
            mines++;
        } else {
            updatedData[x][y].isFlagged = true;
            mines--;
        }

        if (mines === 0) {
            const mineArray = this.getMines(updatedData);
            const flagArray = this.getFlags(updatedData);

            if (JSON.stringify(mineArray) === JSON.stringify(flagArray)) {
                this.setState({ mineCount: 0, gameStatus: "You Win.", gameFinished: true});
                this.revealBoard();
            }
        }

        this.setState({
            boardData: updatedData,
            mineCount: mines,
        })
    }

    renderBoard(data) {
        return data.map((datarow) => {
            return datarow.map((dataitem) => {
                return (
                    <div key={dataitem.x * datarow.length + dataitem.y}>
                        <Cell 
                            onClick={() => this.handleCellClick(dataitem.x, dataitem.y)}
                            cMenu={(e) => this.handleContextMenu(e, dataitem.x, dataitem.y)}
                            value={dataitem} 
                        />

                        {(datarow[datarow.length - 1] === dataitem) ? <div className="clear" /> : ""}
                    </div>
                );
            })
        })
    }

    render() {
        return(
            <div className="screen">
                <div className="game-info">
                    <span className="info">
                        mines: {this.state.mineCount}
                    </span>
                    <br />
                    <h1 className="info">
                        {this.state.gameStatus}
                    </h1>
                </div>
                <div className="settings">
                    <h3>Game Settings</h3>
                </div>
                <div className="board">
                    { this.renderBoard(this.state.boardData) }
                </div>
                { this.state.gameFinished ? 
                    <div className="replay">
                        <h2>Play Again?</h2>
                    </div> 
                    : null }
            </div>
        );
    }
}

Board.propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    mines: PropTypes.number,
    firstMoveMade: PropTypes.bool
}