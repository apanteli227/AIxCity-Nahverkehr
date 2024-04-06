import React from "react";
import { MdOutlineTram } from "react-icons/md";
import { VscGraph } from "react-icons/vsc";
import { FaRegMap } from "react-icons/fa";
import { FaRoute } from "react-icons/fa";

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  return (
    <aside
      id="sidebar"
      className={openSidebarToggle ? "sidebar-responsive" : ""}
    >
      <div className="sidebar-title">
        <div className="sidebar-brand">
          <MdOutlineTram className="icon_header" /> BSAG
        </div>
        <span className="icon close_icon" onClick={OpenSidebar}>
          X
        </span>
      </div>

      <ul className="sidebar-list">
        <li className="sidebar-list-item">
          <a href="/">
            <VscGraph className="icon" /> Statistiken
          </a>
        </li>
        <li className="sidebar-list-item">
          <a href="/map">
            <FaRegMap className="icon" /> Karte
          </a>
        </li>
        <li className="sidebar-list-item">
          <a href="/Weg">
            <FaRoute className="icon" /> Routenplaner
          </a>
        </li>
        <li className="sidebar-list-item">
          <a href="/Prognose">
            <FaRoute className="icon" /> Prognose
          </a>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
