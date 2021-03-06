import './style.less'

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import muiThemeable from 'material-ui/styles/muiThemeable'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import Snackbar from 'material-ui/Snackbar'
import CircularProgress from 'material-ui/CircularProgress'

const style = {
  dialogContent: {
    width: '380px'
  },
  dialogTitle: {
    paddingBottom: '0'
  },
  textField: {
    width: '332px'
  },
  snackbar: {
    maxWidth: '150px'
  },
  loading: {
    position: 'relative',
    top: '6px',
    height: '24px',
    minWidth: '88px',
    textAlign: 'center'
  }
}

class Feedback extends Component {
  static contextTypes = {
    intl: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      content: '',
      dialogOpen: false,
      snackbarOpen: false,
      snackbarMessage: '',
      loading: false
    }
    this.emailPattern = /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/
    // this.feedbackUrl = 'http://localhost:5300/api/feedback'
    this.feedbackUrl = 'https://tab.xiejie.co/api/feedback'
  }
  openDialog = () => {
    this.setState({
      dialogOpen: true
    })
  }
  hideDialog = () => {
    this.setState({
      dialogOpen: false,
      email: '',
      content: ''
    })
  }
  closeSnackerbar = () => {
    this.setState({
      snackbarOpen: false
    })
  }
  /**
   * watch email and content
   */
  emailChange = (e, nv) => {
    this.setState({
      email: nv
    })
  }
  contentChange = (e, nv) => {
    this.setState({
      content: nv
    })
  }
  /**
   * submit feedback
   */
  handleSubmit = () => {
    const { intl } = this.context
    const { email, content, loading } = this.state

    // prevent multipul submit
    if (loading) return
    
    if (email && !this.emailPattern.test(email)) {
      this.setState({
        snackbarOpen: true,
        snackbarMessage: intl.formatMessage({ id: 'feedback.email.error' })
      })
      return
    }
    if (!content) {
      this.setState({
        snackbarOpen: true,
        snackbarMessage: intl.formatMessage({ id: 'feedback.message.error' })
      })
      return
    }
    this.setState({
      loading: true
    })
    fetch(this.feedbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `email=${email}&content=${content}`
    }).then(res => {
      if (res.ok) {
        res.json().then(data => {
          this.setState({
            snackbarOpen: true,
            snackbarMessage: data.code ? data.msg : intl.formatMessage({ id: 'feedback.success' })
          })
          this.setState({
            loading: false
          })
          setTimeout(() => {
            this.hideDialog()
          }, 1500)
        })
      }
    })
  }
  render() {
    const { dialogOpen, snackbarOpen, snackbarMessage, loading } = this.state
    const { muiTheme } = this.props
    const { intl } = this.context

    const Loading = <CircularProgress style={style.loading} size={24} thickness={2} />
    const Confirm = (
      <FlatButton
        label={intl.formatMessage({ id: 'button.confirm' })}
        primary={true}
        onClick={this.handleSubmit}
      />
    )

    const actions = [
      <FlatButton
        label={intl.formatMessage({ id: 'button.cancel' })}
        primary={true}
        onClick={this.hideDialog}
      />,
      loading ? Loading : Confirm
    ]

    return (
      <div>
        <FlatButton
          className="feedback"
          label={intl.formatMessage({ id: 'settings.feedback' })}
          onClick={this.openDialog}
        />
        <Dialog
          title={intl.formatMessage({ id: 'settings.feedback' })}
          actions={actions}
          modal={false}
          open={dialogOpen}
          onRequestClose={this.hideDialog}
          contentStyle={style.dialogContent}
          titleStyle={style.dialogTitle}
        >
          <TextField
            floatingLabelText={intl.formatMessage({ id: 'feedback.email.placeholder' })}
            style={style.textField}
            onChange={this.emailChange}
          /><br />
          <TextField
            multiLine={true}
            floatingLabelText={intl.formatMessage({ id: 'feedback.message.placeholder' })}
            rows={2}
            rowsMax={4}
            style={style.textField}
            onChange={this.contentChange}
          />
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          message={snackbarMessage}
          autoHideDuration={2000}
          onRequestClose={this.closeSnackerbar}
        />
      </div>
    )
  }
}

export default muiThemeable()(Feedback)
