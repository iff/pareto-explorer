View = require '../view'
fs   = require('fs')

class FrontView extends View

    headerData: ->
        console.log @req.body
        if @req.files?.filename?
            jsondata = fs.readFileSync @req.files.filename.path
            data = JSON.parse jsondata
            columns = []
            return Object.keys(data.solutions[0])
            #for k,v of data.solutions[0]
                #columns.push k
            #return columns
        else
            return null

    paretoData: ->
        if @req.files?.filename?
            jsondata = fs.readFileSync @req.files.filename.path
            data = JSON.parse jsondata
            table = []
            for sol in data.solutions
                row = []
                for k,v of sol
                    row.push v
                table.push row
            return table
        else
            return null

    sols: ->
        if @req.files?.filename?
            jsondata = fs.readFileSync @req.files.filename.path
            data = JSON.parse jsondata
            return JSON.stringify(data.solutions)

module.exports = FrontView
