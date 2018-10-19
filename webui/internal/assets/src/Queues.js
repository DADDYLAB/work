import React from 'react';
import PropTypes from 'prop-types';
import styles from './bootstrap.min.css';
import cx from './cx';

export default class Queues extends React.Component {
    static propTypes = {
        url: PropTypes.string,
        pauseUrl: PropTypes.string,
        continueUrl: PropTypes.string,
    }

    state = {
        queues: []
    }

    fetch() {
        if (!this.props.url) {
            return;
        }
        fetch(this.props.url).then((resp) => resp.json()).then((data) => {
            this.setState({queues: data});
        });
    }

    componentWillMount() {
        this.fetch()
    }

    get queuedCount() {
        let count = 0;
        this.state.queues.map((queue) => {
            count += queue.count;
        });
        return count;
    }

    pausedTest(is_p) {
        if (is_p == false) {
            return "暂停"
        } else {
            return "运行"
        }
    }

    pause(jn, ip) {
        if (ip == false) {
            // 暂停
            fetch(this.props.pauseUrl + "?job_name=" + jn).then(() => {
                this.fetch();
            });
        } else {
            // 运行
            fetch(this.props.continueUrl + "?job_name=" + jn).then(() => {
                this.fetch();
            });
        }
    }

    render() {
        return (
            <div className={cx(styles.panel, styles.panelDefault)}>
                <div className={styles.panelHeading}>queues</div>
                <div className={styles.panelBody}>
                    <p>共 {this.state.queues.length} 个任务队列 . 共 {this.queuedCount} 个任务入队 . (暂停任务将导致没有 Work
                        运行该任务，重试、定时皆无效)</p>
                </div>
                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <tbody>
                        <tr>
                            <th>任务队列名</th>
                            <th>队列当前任务数</th>
                            <th>队列延迟时间（秒）</th>
                            <th>是否暂停</th>
                            <th></th>
                        </tr>
                        {
                            this.state.queues.map((queue) => {
                                return (
                                    <tr key={queue.job_name}>
                                        <td>{queue.job_name}</td>
                                        <td align="center">{queue.count}</td>
                                        <td align="center">{queue.latency}</td>
                                        <td>{this.pausedTest(!queue.is_paused)}</td>
                                        <td>
                                            <button type="button" className={cx(styles.btn, styles.btnDefault)}
                                                    onClick={() => this.pause(queue.job_name, queue.is_paused)}> {this.pausedTest(queue.is_paused)} </button>
                                        </td>
                                    </tr>
                                );
                            })
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
