import { h, Component } from 'preact';
import style from './style';


function formatDate(d) {
	var dd = new Date(d)
	return dd.toISOString().slice(0,19).replace("T", " ")
}

export default class Thread extends Component {
	constructor(props) {
		super(props);
		this.reload = this.reload.bind(this)
		this.deleteComment = this.deleteComment.bind(this)
		this.undoDelete = this.undoDelete.bind(this)
		this.handleBodyChange = this.handleBodyChange.bind(this);
		this.handleAuthorChange = this.handleAuthorChange.bind(this);
	}
	handleAuthorChange(id, value) {
		const found = this.props.comments.find(x => x.Id == id)
		if (found) {
			this.props.updateComment(id, null, value, null)
		}
	}
	handleBodyChange(id, value) {
		const found = this.props.comments.find(x => x.Id == id)
		if (found) {
			this.props.updateComment(id, value, null, null)
		}
	}
	reload() {
		this.props.reload()
	}
	deleteComment(commentId) {
		if (typeof window == "undefined") { return }
		var http = new XMLHttpRequest();
		var url = "http://localhost:7777/v1/admin/comments";
		http.open("DELETE", url, true);
		var context = this;
		http.onreadystatechange = function () {
			if (http.readyState == 4 && http.status == 204) {
				var comments = context.props.comments.filter(x => x.Id != commentId)
				context.setState({comments})
				context.reload()
			} else if (http.readyState == 4 && http.status == 401) {
				context.reload()
			} else {
				context.reload()
			}
		}
		http.send(JSON.stringify({ CommentId: commentId }))
	}
	undoDelete(commentId) {
		if (typeof window == "undefined") { return }
		var http = new XMLHttpRequest();
		var url = "http://localhost:7777/v1/admin/comments/restore";
		http.open("POST", url, true);
		var context = this;
		http.onreadystatechange = function () {
			if (http.readyState == 4 && http.status == 204) {
				var comments = context.props.comments.filter(x => x.Id != commentId)
				context.setState({comments})
				context.reload()
			} else if (http.readyState == 4 && http.status == 401) {
				context.reload()
			} else {
				context.reload()
			}
		}
		http.send(JSON.stringify({ CommentId: commentId }))
	}
	

	render() {
		let comments = ""
		// this is a terrible hack for showing unconfirmeds
		if (this.props.comments.filter(comment => comment.ReplyTo == null && comment.DeletedAt == null).length == 0) {
			comments = this.props.comments.map(comment => {
				return <div class={style.comment}>
					<div class={style.author}>By: <input type="text" value={comment.Author} onChange={(e) => {
						this.handleAuthorChange(comment.Id, e.target.value)
					}}></input></div>
					<div class={style.date}>{formatDate(comment.CreatedAt)}</div>
					<div><textarea class={style.commentBody} value={comment.Body} onChange={(e) => {
						this.handleBodyChange(comment.Id, e.target.value)
					}}></textarea></div>
					<div class={style.buttons}>
						<div class={style.smallButton}  onClick={() => this.props.updateComment(comment.Id, comment.Body, comment.Author, comment.Confirmed)}>Update</div>
						{comment.DeletedAt == null ? <div class={style.smallButton}  onClick={() => this.deleteComment(comment.Id)}>Delete</div> : <div class={style.smallButton} onClick={() => this.undoDelete(comment.Id)}>Undo delete</div>}
						{comment.Confirmed ? "" : <div class={style.smallButton} onClick={() => this.props.updateComment(comment.Id, null, null, true)}>Confirm</div>}
					</div>
				</div>;
			})
		} else {
			comments = this.props.comments.filter(comment => comment.ReplyTo == null || comment.DeletedAt != null).map(comment => {
				var replies = this.props.comments.filter(x => x.ReplyTo === comment.Id).map(x => {
					return <div class={style.commentReply}>
						<div  class={style.author}>By: <input type="text" value={x.Author} onChange={(e) => {
						this.handleAuthorChange(x.Id, e.target.value)
					}}></input></div>
						<div class={style.date}>{formatDate(x.CreatedAt)}</div>
						<div><textarea class={style.commentBody}  value={x.Body} onChange={(e) => {
						this.handleBodyChange(x.Id, e.target.value)
					}}></textarea></div>
						<div class={style.buttons}>
							<div class={style.smallButton} onClick={() => this.props.updateComment(x.Id, x.Body, x.Author, x.Confirmed)}>Update</div>
							{x.DeletedAt == null ? <div class={style.smallButton} onClick={() => this.deleteComment(x.Id)}>Delete</div> : <div class={style.smallButton} onClick={() => this.undoDelete(x.Id)}>Undo delete</div>}
							{x.Confirmed ? "" : <div class={style.smallButton} onClick={() => this.props.updateComment(x.Id, null, null, true)}>Confirm</div> }
						</div>
					</div>
				});
				return <div class={style.comment}>
					<div class={style.author}>By: <input type="text" value={comment.Author} onChange={(e) => {
						this.handleAuthorChange(comment.Id, e.target.value)
					}}></input></div>
					<div class={style.date}>{formatDate(comment.CreatedAt)}</div>
					<div><textarea class={style.commentBody} value={comment.Body} onChange={(e) => {
						this.handleBodyChange(comment.Id, e.target.value)
					}}></textarea></div>
					<div class={style.buttons}>
						<div class={style.smallButton} onClick={() => this.props.updateComment(comment.Id, comment.Body, comment.Author, comment.Confirmed)}>Update</div>
						{comment.DeletedAt == null ? <div class={style.smallButton} onClick={() => this.deleteComment(comment.Id)}>Delete</div> : <div class={style.smallButton} onClick={() => this.undoDelete(comment.Id)}>Undo delete</div>}
						{comment.Confirmed ? "" : <div class={style.smallButton} onClick={() => this.props.updateComment(comment.Id, null, null, true)}>Confirm</div> }
					</div>
					<div style="margin-left:30px">
						{replies}
					</div>
				</div>;
			})
		}
		const fullThread = comments.length > 0 ? (<div class="thread">
		<h2>{this.props.thread.Path}</h2>
		<div class="comments">
			{comments}
		</div>
	</div>) : null
		return fullThread
		
	}
}