#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use calamine::{open_workbook, Xlsx, Reader};
use tauri::{Menu};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn read_excel() -> Result<Vec<[String; 3]>, String>{

    let mut name_list = Vec::new();

    let excel_file = open_workbook("namelist.xlsx");

    if excel_file.is_ok() {
        let mut excel: Xlsx<_> = excel_file.unwrap();

        if let Some(Ok(r)) = excel.worksheet_range("random") {
            for row in r.rows() {
                name_list.push([row[0].to_string(), row[1].to_string(), row[2].to_string()]);
            }
        }

        return Ok(name_list);
    }
    Err("ไม่สามารถเปิดไฟล์ข้อมูลได้ (namelist.xlsx)".to_string())
}

fn main() {

    let menu = Menu::new();

    tauri::Builder::default()
        .menu(menu)
        .invoke_handler(tauri::generate_handler![read_excel])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
