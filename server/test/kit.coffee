require('chai').should()
assert = require("assert")
fs = require 'fs'
path = require 'path'
kitFs = require '../kit/fs.js'

describe 'kit', ->
    describe '.fs', ->
        filename = 'test.file'
        anotherFile = 'another.file'
        multiPar = '000multi'
        opt = {}
        opt.src = '000src1'
        opt.dest = '000dest1'
        opt.multiDest = path.join multiPar, 'test'
        opt.file = path.join opt.src, filename

        beforeEach (done) ->
            fs.mkdir opt.src, () ->
                fs.open opt.file, 'a+', () ->
                    done()

        afterEach (done) ->
            kitFs.rm {path: opt.dest}, (err) ->
                if err 
                    return done err
                else
                    done()

        after (done) ->
            kitFs.rm {path: opt.src}, (err) ->
                if err 
                    return done err
                else
                    done()

        describe '.mkdir', ->
            it 'should be make a single dir', (done) ->
                kitFs.mkdir {path: opt.dest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists opt.dest, (exists) ->
                            exists.should.be.ok
                            done()

            it 'should be make multi-level dir', (done) ->
                kitFs.mkdir {path: opt.multiDest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists opt.multiDest, (exists) ->
                            exists.should.be.ok
                            done()


        describe '.rm', ->
            it 'should be rm single dir', (done) ->
                fs.mkdirSync opt.dest
                kitFs.rm {path: opt.dest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists opt.dest, (exists) ->
                            exists.should.be.false
                            done()

            it 'should be rm multi-level dir', (done) ->
                kitFs.mkdir {path: opt.multiDest}, () ->
                    kitFs.rm {path: multiPar}, (err) ->
                        if err
                            return done err
                        else
                            fs.exists opt.multiDest, (exists) ->
                                exists.should.be.false
                                done()

        describe '.mv', ->
            it 'should be move file to an existing dir', (done) ->
                dest = path.join(opt.src, 'middle')
                fs.mkdirSync(dest)
                kitFs.mv {src: opt.file, dest: dest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists dest, (exists) ->
                            exists.should.be.ok
                            done()

            it 'should be move file to a not existing dir', (done) ->
                dest = path.join(opt.dest, 'middle')
                kitFs.mv {src: opt.file, dest: dest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists dest, (exists) ->
                            exists.should.be.ok
                            done()

            it 'should be move dir to an existing dir', (done) ->
                dest = opt.dest
                fs.mkdirSync(dest)
                kitFs.mv {src: opt.src, dest: dest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists dest, (exists) ->
                            exists.should.be.ok
                            done()

            it 'should be move dir to a not existing dir', (done) ->
                dest = path.join(opt.dest, 'middle')
                kitFs.mv {src: opt.src, dest: dest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists dest, (exists) ->
                            exists.should.be.ok
                            done()

            it 'should be rename file to an existing dir', (done) ->
                dest = path.join(opt.src, anotherFile)
                kitFs.mv {src: opt.file, dest: dest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists dest, (exists) ->
                            exists.should.be.ok
                            done()

            it 'should be rename file to a not existing dir', (done) ->
                dest = path.join(opt.dest, anotherFile)
                kitFs.mv {src: opt.file, dest: dest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists dest, (exists) ->
                            exists.should.be.ok
                            done()

            it 'should be rename dir to an existing dir', (done) ->
                dest = opt.dest
                kitFs.mv {src: opt.src, dest: dest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists dest, (exists) ->
                            exists.should.be.ok
                            done()

            it 'should be rename dir to a not existing dir', (done) ->
                dest = path.join(opt.dest, 'middle')
                kitFs.mv {src: opt.src, dest: dest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists dest, (exists) ->
                            exists.should.be.ok
                            done()

        describe '.cp', ->
            it 'should be cp file to a file', (done) ->
                dest = path.join opt.src, anotherFile
                kitFs.cp {src: opt.file, dest: dest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists dest, (exists) ->
                            exists.should.be.ok
                            done()
            
            it 'should be cp file to a dir', (done) ->
                dest = opt.dest
                fs.mkdirSync dest
                kitFs.cp {src: opt.file, dest: dest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists dest, (exists) ->
                            exists.should.be.ok
                            done()
            
            it 'should be cp dir to a dir', (done) ->
                kitFs.cp {src: opt.src, dest: opt.dest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists opt.dest, (exists) ->
                            exists.should.be.ok
                            done()

            it 'should be cp dir to a not existing dir', (done) ->
                kitFs.cp {src: opt.src, dest: opt.multiDest}, (err) ->
                    if err
                        return done err
                    else
                        fs.exists opt.multiDest, (exists) ->
                            exists.should.be.ok
                            done()
