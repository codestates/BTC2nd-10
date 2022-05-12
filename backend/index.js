const cron = require("node-cron");
const { getCurrentBlockNumber, getNewTxs, notify_to_mid_sever } = require("./utils");
const fs = require("fs");
const path = require("path");
const basePath = __dirname;
let wait_for_prev_job = false;
let FIRST = true;

const cron_job = cron.schedule(
    "*/1 * * * * *", // TODO: 시간 조정
    async () => {
        try {
            if (wait_for_prev_job) {
                console.log("already running")
                return;
            }
            wait_for_prev_job = true;
            let syncFrom =
                Number(
                    fs.readFileSync(path.join(basePath, "./block_height"), {
                        encoding: "utf-8",
                    })
                ) + 1;

            let currentBlockNumber = await getCurrentBlockNumber();
            console.log(syncFrom, currentBlockNumber);
            if (FIRST) {
                console.log("is first running")
                syncFrom = currentBlockNumber - 3;
                FIRST = false;
            }
            if (syncFrom > currentBlockNumber) {
                console.log("syncFrom is larger returnning")
                wait_for_prev_job = false;
                return;
            }

            const txs = await getNewTxs(syncFrom, currentBlockNumber);
            if(txs != null){
                const works = [];
                for (let tx of txs) {
                    works.push(notify_to_mid_sever(tx));
                }

                if (works.length > 0) {
                    Promise.all(works).then(() => {
                        if (currentBlockNumber >= syncFrom) {
                            console.log(`Cronjob done. block hegight ${syncFrom} ~ ${currentBlockNumber} ====`);
                            fs.writeFileSync(
                                path.join(basePath, "./block_height"),
                                String(currentBlockNumber)
                            );
                            wait_for_prev_job = false;
                        }
                    }).catch(error => {
                        console.error(error.message)
                    });
                }
            }
            wait_for_prev_job = false;
        } catch (e) {
            console.log(e.message);
        }
    },
    {
        scheduled: false,
    }
);
cron_job.start();
