import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import CssMinimizerWebpackPlugin from "css-minimizer-webpack-plugin";
import EslintWebpackPlugin from "eslint-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as path from "path";
import ReactRefreshTypeScript from "react-refresh-typescript";
import * as webpack from "webpack";
import "webpack-dev-server";

type Env = "development" | "production";

function isEnv(value: string): value is Env {
  return value === "development" || value === "production";
}

const env =
  process.env.REACT_APP_ENV && isEnv(process.env.REACT_APP_ENV)
    ? process.env.REACT_APP_ENV
    : "production";

function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

function compact<T>(values: Array<T>): Array<NonNullable<T>> {
  return values.filter(isNonNullable);
}

/**
 * style-loader must be fist in the list
 */
const cssLoaders: webpack.RuleSetUse = [
  env === "production" ? MiniCssExtractPlugin.loader : "style-loader",
  "css-loader",
  {
    loader: "postcss-loader",
    options: {
      postcssOptions: {
        plugins: [require("tailwindcss"), require("autoprefixer")],
      },
    },
  },
];

const config: webpack.Configuration = {
  mode: env,
  entry: {
    bundle: path.resolve(__dirname, "src/index.tsx"),
  },
  output: {
    clean: true,
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "build"),
  },
  devServer: {
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    compress: true,
    historyApiFallback: true,
    hot: true,
    open: false,
    port: 3000,
    static: {
      directory: path.resolve(__dirname, "build"),
    },
  },
  devtool: env === "development" ? "source-map" : false,
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        type: "asset/resource",
      },
      {
        test: /\.css$/,
        use: cssLoaders,
      },
      {
        test: /\.scss$/,
        use: [...cssLoaders, "sass-loader"],
      },
      {
        exclude: /node_modules/,
        test: /\.(ts|tsx)$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: env === "development",
            getCustomTransformers: () => ({
              before: compact([env === "development" ? ReactRefreshTypeScript() : null]),
            }),
          },
        },
      },
    ],
  },
  optimization: {
    minimize: env === "production",
    minimizer: [new CssMinimizerWebpackPlugin(), "..."],
    /**
     * TODO understand what's going on here :)
     */
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          chunks: "all",
          name: "vendors",
          priority: -10,
          reuseExistingChunk: true,
          test: /[\\/]node_modules[\\/]/,
        },
      },
      chunks: "async",
    },
  },
  plugins: compact([
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "public/index.html",
    }),
    env === "production" ? new CleanWebpackPlugin() : null,
    env === "production" ? new MiniCssExtractPlugin() : null,
    env === "production"
      ? new CopyWebpackPlugin({
          patterns: [
            {
              from: "public",
              /**
               * Copy everything but index.html
               */
              filter: (path) => !path.endsWith("index.html"),
            },
          ],
        })
      : null,
    /**
     * Output TS errors in the console
     */
    env === "development" ? new ForkTsCheckerWebpackPlugin() : null,
    env === "development" ? new ReactRefreshWebpackPlugin({ overlay: true }) : null,
    env === "development"
      ? new EslintWebpackPlugin({ extensions: ["ts", "tsx"], failOnError: false, files: "./src" })
      : null,
  ]),
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  /**
   * Control what bundle information gets displayed
   */
  stats: {
    preset: "errors-warnings",
  },
};

export default config;
