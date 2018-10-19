import React from 'react';
import PropTypes from 'prop-types';
import UnixTime from './UnixTime';
import ShortList from './ShortList';
import styles from './bootstrap.min.css';
import cx from './cx';

class BusyWorkers extends React.Component {
  static propTypes = {
    worker: PropTypes.arrayOf(PropTypes.object).isRequired,
  }

  render() {
    return (
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <tbody>
            <tr>
              <th>Name</th>
              <th>Arguments</th>
              <th>Started At</th>
              <th>Check-in At</th>
              <th>Check-in</th>
            </tr>
            {
              this.props.worker.map((worker) => {
                return (
                  <tr key={worker.worker_id}>
                    <td>{worker.job_name}</td>
                    <td>{worker.args_json}</td>
                    <td><UnixTime ts={worker.started_at}/></td>
                    <td><UnixTime ts={worker.checkin_at}/></td>
                    <td>{worker.checkin}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );
  }
}

export default class Processes extends React.Component {
  static propTypes = {
    busyWorkerURL: PropTypes.string,
    workerPoolURL: PropTypes.string,
  }

  state = {
    busyWorker: [],
    workerPool: []
  }

  componentWillMount() {
    if (this.props.busyWorkerURL) {
      fetch(this.props.busyWorkerURL).
        then((resp) => resp.json()).
        then((data) => {
          if (data) {
            this.setState({
              busyWorker: data
            });
          }
        });
    }
    if (this.props.workerPoolURL) {
      fetch(this.props.workerPoolURL).
        then((resp) => resp.json()).
        then((data) => {
          let workers = [];
          data.map((worker) => {
            if (worker.host != '') {
              workers.push(worker);
            }
          });
          this.setState({
            workerPool: workers
          });
        });
    }
  }

  get workerCount() {
    let count = 0;
    this.state.workerPool.map((pool) => {
      count += pool.worker_ids.length;
    });
    return count;
  }

  getBusyPoolWorker(pool) {
    let workers = [];
    this.state.busyWorker.map((worker) => {
      if (pool.worker_ids.includes(worker.worker_id)) {
        workers.push(worker);
      }
    });
    return workers;
  }

  render() {
    return (
      <section>
          <header> <h3>工作池集群管理</h3> </header>
        <p> 当前线上共 {this.state.workerPool.length} 个工作池， 共 {this.workerCount} 个工人， {this.state.busyWorker.length} 个正忙 .</p>
        {
          this.state.workerPool.map((pool) => {
            let busyWorker = this.getBusyPoolWorker(pool);
            return (
              <div key={pool.worker_pool_id} className={cx(styles.panel, styles.panelDefault)}>
                <div className={styles.tableResponsive}>
                  <table className={styles.table}>
                    <tbody>
                      <tr>
                        <td>Host： {pool.host}: {pool.pid}</td>
                        <td>启动时间： <UnixTime ts={pool.started_at}/></td>
                        <td>最近一次的心跳包： <UnixTime ts={pool.heartbeat_at}/></td>
                        <td>并发数： {pool.concurrency}</td>
                      </tr>
                      <tr>
                        <td colSpan="4">Servicing <ShortList item={pool.job_names} />.</td>
                      </tr>
                      <tr>
                        <td colSpan="4">活跃工人： {busyWorker.length}  , 可用工人：{pool.worker_ids.length - busyWorker.length} .  当前执行任务列表：</td>
                      </tr>
                      <tr>
                        <td colSpan="4">
                          <div className={cx(styles.panel, styles.panelDefault)}>
                            <BusyWorkers worker={busyWorker} />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        }
      </section>
    );
  }
}
