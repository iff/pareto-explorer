{ _ } = require 'underscore'

templateLocals = (req, res, viewName) ->
    viewHelperClass = require("#{__dirname}/../views/#{viewName}")
    return new viewHelperClass req, res

exports.render = (req, res, viewname) ->
    view = templateLocals req, res, viewname

    locals = _.extend view, { viewPartialName: viewname }
    res.render 'onecolumn', locals

