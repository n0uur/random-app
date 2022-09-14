import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import sleep from "./lib/sleep";
import { dialog } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import Particles from "react-particles";
import { loadFull } from "tsparticles";

import particleOption from "./lib/particle.json"

function App() {
  const [nameList, setNameList] = useState();

  const [winner, setWinner] = useState();
  const [isGotWinner, setIsGotWinner] = useState(false);
  const [particleContainer, setParticleContainer] = useState(null)

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    container.stop()
    setParticleContainer(container)
  }, []);

  async function readExcel() {
    let name;
    try {
      name = await invoke("read_excel");
    } catch (e) {
      dialog.message(e, {
        title: "เกิดข้อผิดพลาด",
        type: "error",
      });
    }

    if (!name.length) {
      dialog.message(
        'ไม่พบรายการข้อมูลในไฟล์ Sheet "random" โปรดตรวจสอบ Sheet หรือวิธีการวางในคอลลัมให้ถูกต้อง',
        {
          title: "ไม่พบรายการข้อมูล",
          type: "error",
        }
      );
    }

    setNameList(
      name.map((name) => {
        return {
          id: name[0],
          name: name[1],
          department: name[2],
        };
      })
    );
  }

  useEffect(() => {
    readExcel();
    appWindow.setTitle("สุ่มชื่อผู้โชคดี");
  }, []);

  function random(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  async function randomLucky() {
    setIsGotWinner(false);
    for (let i = 0; i < 100; i++) {
      setWinner(random(nameList));
      await sleep(10);
    }
    for (let i = 0; i < 20; i++) {
      setWinner(random(nameList));
      await sleep(100);
    }
    for (let i = 0; i < 5; i++) {
      setWinner(random(nameList));
      await sleep(500);
    }
    setIsGotWinner(true);
    if(particleContainer) {
      particleContainer.refresh()
    }
  }

  return (
    <div>
      <div className="grid place-items-center h-screen">
        <div className="text-center">
          <h1 className="text-5xl">สุ่มผู้โชคดี</h1>
          {winner ? (
            <>
              <h2 className={`text-6xl mt-6 ${isGotWinner ? 'winner-name' : ''}`}>{winner.name}</h2>
              <h3 className="text-2xl mt-6">
                รหัสพนักงาน {winner.id || "-"} แผนก {winner.department || "-"}
              </h3>
            </>
          ) : (
            <>
              <h2 className="text-6xl mt-6">ผู้โชคดี ได้แก่....</h2>
              <h3 className="text-2xl mt-6">รหัสพนักงาน .... แผนก ....</h3>
            </>
          )}

          <div
            className="btn btn-primary text-xl mt-10"
            onClick={() => randomLucky()}
          >
            เริ่มสุ่มผู้โชคดี
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div className="p-4">
        <div className="text-right">
          <div className="btn">โหลดไฟล์ Excel</div>
        </div>

        <div className="overflow-x-auto mt-5">
          <table className="table w-full text-center">
            <thead>
              <tr>
                {/* <th>ลำดับ</th> */}
                <th>รหัสพนักงาน</th>
                <th>ชื่อ</th>
                <th>แผนก</th>
              </tr>
            </thead>
            <tbody>
              {nameList?.map((name, index) => (
                <tr key={name.id}>
                  {/* <th>{index + 1}</th> */}
                  <td>{name["id"]}</td>
                  <td>{name["name"]}</td>
                  <td>{name["department"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Particles id="tsparticles" options={particleOption} init={particlesInit} loaded={particlesLoaded} style={{ display: particleContainer ? 'block':'none' }} />
    </div>
  );
}

export default App;
