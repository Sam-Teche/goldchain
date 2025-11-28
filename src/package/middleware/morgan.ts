// @ts-ignore
import morgan from "morgan";
import {Environment} from "../configs/environment";
import chalk from "chalk";
import {Request, Response} from "express";

const environmentVariables = new Environment();

const skip = () => {
    const env = environmentVariables.nodeENV || "development";
    return env !== "development";
};

// const morganMiddleware = morgan(
//     ":method :url :status :res[content-length] - :response-time ms",
//     { skip }
// );


morgan.token('status-colored', (req: Request, res: Response) => {
    // Get the status code
    const status = res.statusCode;
    let color;
    if (status >= 500) {
        color = chalk.red;
    } else if (status >= 400) {
        color = chalk.yellow;
    } else if (status >= 300) {
        color = chalk.cyan;
    } else {
        color = chalk.green;
    }

    return color(status);
});

// Define colored format
const morganFormat = ':method :url :status-colored :response-time ms';

const morganMiddleware = morgan(morganFormat);

export default morganMiddleware;