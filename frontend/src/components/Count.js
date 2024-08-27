import React from 'react';
import { Component } from 'react';
class Count extends Component{
    constructor(){
        super()
        this.state = {
            count : 0
        }
    }
    incrementFunction(){
        // this.setState({
        //     count : this.state.count + 1
        // },
        // ()=> console.log(this.state.count));
        // console.log(this.state.count);
        console.log(this);
        this.setState((prevState,props ) =>({
            count : prevState.count + props.add
        }),()=>console.log(this.state.count))
    }
    incrementFive(){
        this.incrementFunction()
        this.incrementFunction()
        this.incrementFunction()
        this.incrementFunction()
        this.incrementFunction()
    }
    render(){
        return(
            <div class="background-element">
                <p> Count : {this.state.count}</p>
                <button onClick ={() => this.incrementFunction()}> Increment</button>
            </div>
        )
    }
}
export default Count;