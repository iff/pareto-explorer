

## Requirements

The following tools are required to get encounter up and running:

 * [node.js](http://nodejs.org/) 0.6.x
 * [npm](http://npmjs.org/) 1.x
 * IE10 developer preview, Firefox 7 or Chrome 14-16 (any later versions may work but it's not guaranteed)

## Howto


After you install all dependencies (see above), use the following guide to get the code and
start the server:

    # Get the code
    git clone git@github.com:iff/pareto-explorer.git
    cd pareto-explorer

    # Install node packages (external dependencies)
    npm install

    # Start the server and open in browser (it runs on port 3333)
    ./node_modules/coffee-script/bin/coffee server.coffee
    open http://localhost:3333


## File Format

We use JSON to transfer the set of Pareto points to the visualization server.
A file can be uploaded in the corresponding mask. The JSON file should have
the following format:

    sols = [
        {
            "ID": 0,
            "ode [KeV]":      10.3988,
            "oex [mm mrad]":  2.23702e-06,
            "orx [mm]":       0.00129222,
            "velocity [m/s]": 0.68,
            "energy [MeV]":   0.004,
            "rms_z [mm]":     0.001
        },
        {
            "ID": 2,
            "ode [KeV]":      9.36923,
            "oex [mm mrad]":  1.70587e-06,
            "orx [mm]":       0.00132264,
            "velocity [m/s]": 0.58,
            "energy [MeV]":   0.024,
            "rms_z [mm]":     0.003
        },
        ...
    ]

The keys are used as axis labels or identifiers. The only mandatory field is
the `ID` field. These values should be unique. An example file is provided in
the `example-data` directory.

## License

The code is under MIT license, see LICENSE, unless otherwise stated.
