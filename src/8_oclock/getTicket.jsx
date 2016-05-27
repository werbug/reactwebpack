import React from 'react';

/**
 * 这个现在是做成当页的弹出框了，没有被用到
 */
class GetTicket extends React.Component {
    
    constructor(props) {
        super(props);
    }
    
    _getTicket() {
        //
        this.props.history.replace('/');
    }
    
    render() {
        return (
            <div className="body mask">
                <div className="dialog">
                    <section className="cont">
                        <div className="ticket"></div>
                    </section>
                    <section className="btn-area">
                        <button type="button" onClick={this._getTicket.bind(this)}>马上领取</button>
                    </section>
                </div>
            </div>
        );
    }
}

export default GetTicket;