"use strict";
$("head").append(`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;700;900&display=swap" rel="stylesheet">`);

define("tmb/monitorBoard", ["api", "sdlms/eaglebuilder"], function (api, eb) {
	let $monitorBoard = {};
	$monitorBoard.init = (data) => {
		if (!data.tid) {
			throw new Error("Invalid tid supplied");
		}
		$monitorBoard.tid = data.tid;
		$monitorBoard.data = data;
		$monitorBoard.exists = false;
		$monitorBoard.create();
	};
	$monitorBoard.unique = (prefix = "") => {
		var dt = new Date().getTime();
		var uuid = "xxxxxxxx-xxxx-yxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			var r = (dt + Math.random() * 16) % 16 | 0;
			dt = Math.floor(dt / 16);
			return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
		});
		return prefix + uuid;
	};
	$monitorBoard.log = (log) => {
		!$monitorBoard.data.log || console.log(log);
	};
	$monitorBoard.formatTime = (stamp) => {
		var timeLeftForEB = Math.floor((stamp - Date.now()) / 60000);
		var timeLeftForEBHr = Math.floor(timeLeftForEB / 60);
		var timeLeftForEBMin = timeLeftForEB % 60;
		var timeLeftForEBDays = Math.floor(timeLeftForEBHr / 24);
		var timeLeftForEBdhr = timeLeftForEBHr % 24;
		var timeFormat =
			timeLeftForEBDays > 0
				? `${timeLeftForEBDays}days ${timeLeftForEBdhr}hrs`
				: `${timeLeftForEBHr}hrs ${timeLeftForEBMin}mins`;
		return timeFormat;
	};
	$monitorBoard.create = () => {
		var b = document.documentElement;
		b.setAttribute("data-useragent", navigator.userAgent);
		b.setAttribute("data-platform", navigator.platform);
		// this.id = this.unique("sdlms-lesson-");
		$(".tmb").append(`<div></div>`);
		let $board = $(".tmb");
		$monitorBoard.$board = $board;
		{
			ajaxify.data.isTeacher
				? $board.append(`<h1 class="text-muted" >Teacher Monitor Board</h1>`)
				: $board.append(`<h1 class="text-muted" >Student Monitor Board</h1>`);
		}
		var $that = $monitorBoard;
		async function renderupcomingClass(classInformation) {
			// eb.exists(classInformation[0].tid)
			// console.log(checkEB)

			const sdule = classInformation[0].schedule;
			var classEnd = sdule + (5*60*60*1000);
			
			// classInformation[0].isLive = true;
			// console.log("class schedule: ",sdule);
			// console.log("present time: ", Date.now());
			// console.log("classend at: ", classEnd);
			
			$(".tmb").append(`
            <div class="classInfo" >
			<h3 style="font-family: 'Poppins', sans-serif; "><i class="far fa-clock" style="margin:7px 13px 8px; font-size:30px; line-height:34.5px; "></i><span class="is_live" style="width:366px; height:30px; margin:10px 0; font-weight: 700; font-size:20px; line-height: 30px; letter-spacing:0.1em; "><span>YOUR SESSION</span></span></h3>
			<div class="classData">
			<h4 class="class-details" style="font-family: 'Poppins', sans-serif; " ><span class="classInfoBold">${
							classInformation[0].topic || ""
						}</span> for <span class="classInfoBold">${
				classInformation[0].category || ""
			}</span> on ${
				new Date(classInformation[0].schedule || 0).toDateString() || ""
			}
            </h4>
			<h4 style="font-family:'Poppins', sans-serif; color:#696969; font-size:20px; margin:8px 0 20px; font-weight:500; line-height:30px; ">RELATED SESSIONS : ${classInformation.length}</h4>
			<div class="classResVal" style=" font-size:18px; font-family:'Poppins', sans-serif; "></div>
			</div>
            
            </div>
            `);
			

			if(Date.now() < sdule) {
				$(".classResVal").append(`<span style="font-weight: 500; font-size: 20px; line-height: 30px; text-transform: uppercase; color: #000000;">Check back by 8pm</span>`);
			}
			else if(Date.now() >= sdule && Date.now() <= classEnd) {
				if(classInformation[0].isLive){
					$(".classResVal").append(`<button>JOIN SESSION NOW</button>`);
					$(".is_live").append("<span> IS LIVE !!!</span>");
				}else{
					$(".classResVal").append(`<span style="font-weight: 500; font-size: 20px; line-height: 30px; text-transform: uppercase; color: #000000;">waiting for the session to go live!!</span>`);
				}
			}
			

			console.log("class info: ",classInformation);
			
			$(".classInfo").css({
				"width":"936px",
				"background-color": "#FFFFFF",
				"border-radius": "5px",
				margin: "63px auto 15px",
			});

			$(".classInfo h3").css({
				"width":"100%",
				height: "50px",
				"display":"flex",
				"align-items":"center",
				"background-color": "#3683F0",
				color: "rgba(255, 255, 255, 0.99)",
				"border-radius": "5px 5px 0px 0px",
				"margin-top":"7px",

			});

			$(".classData").css({
				"margin":"15px auto 0 55px",
				"padding-bottom":"14px",
				"display":"flex",
				"flex-direction":"column",
				
			}),

			$(".class-details").css({
				"font-size": "24px",
				"font-weight": "400",
				color: "#3683F0",
				"line-height":"36px",
				"letter-spacing":"0.1em",
				"width":"457px",

			});
			$(".classInfoBold").css({
				"text-transform": "uppercase",
				"font-weight": "700",

			});

			$(".classResVal button").css({
				"height":"60px",
				"width":"270px",
				"padding":"1rem 3rem",
				"border":"none",
				"border-radius":"4px",
				"outline":"none",
				"background-color":"#3354FF",
				"font-weight":"700",
				"line-height":"27px",

			});

			// let exists = false;
			if (ajaxify.data.isTeacher) {
				await api
					.get(`/sdlms/${classInformation[0].tid}/eaglebuilder`, {})
					.then((res) => {
						$that.exists = !!Object.keys(res).length;
					});
				if ($that.exists) {
					// if (false) {
					$(".classInfo").append(`<h4 class="EBmapped" > EB Mapped  </h4>`);
				} else {
					if (classInformation[0].schedule <= Date.now()) {
						$(".classInfo").append(
							`<h4>Please map the EB to start the class 
								<button title="map EB" class="eagleBuilderBtn btn btn-primary btn-sm" data-target=".tmb" id="${classInformation[0].tid}" style="margin-right:1rem;"> 
								<i class="fas fa-paperclip"></i> </button>
							</h4>`
						);
					} else {
						$(".classInfo").append(
							`<h4>you got ${
								$that.formatTime(classInformation[0].schedule) || ""
							} to map the EB</h4>`
						);
					}
					$monitorBoard.initEB(classInformation[0].tid, "classInfo");
				}
				$monitorBoard.checkClassStart(
					classInformation[0],
					"classInfo",
					`<button class="startClassBtn btn btn-primary btn-sm" > ${
						!classInformation[0].isLve
							? `<i title="Start Class"  class="fas fa-play"></i>`
							: `<i title="Join class" class="fas fa-sign-in-alt"></i>`
					} </button>`
				);
			} else {
				$monitorBoard.checkClassStart(
					classInformation[0],
					"classInfo",
					`<button class="joinClassBtn btn btn-primary" > <i title="Join class" class="fas fa-sign-in-alt"></i> </button>`
				);
			}

			$(".startClassBtn")
				.off("click")
				.on("click", function () {
					api
						.put(`/sdlms/monitor/${classInformation[0].tid}`, {
							isLive: true,
						})
						.then((r) => {
							location.href =
								location.origin + "/live/" + classInformation[0].tid;
						});
				});
			$(".joinClassBtn")
				.off("click")
				.on("click", function () {
					api
						.put(`/sdlms/sessions/${classInformation[0].tid}/join`)
						.then((res) => {
							socket.emit("meta.live.joined", res, (err) => {
								console.log(err);
							});
							location.href =
								location.origin + "/live/" + classInformation[0].tid;
						});
				});
		}
		if ($monitorBoard.sessionsList("live").length) {
			renderupcomingClass($monitorBoard.sessionsList("live"));
		} else if ($monitorBoard.sessionsList("upcoming").length) {
			renderupcomingClass($monitorBoard.sessionsList("upcoming"));
		} else {
			$(".tmb").append(`
            <div class="classInfo" >
            <h3> You have no Upcoming sessions
            </h3>
            </div>
            `);
		}

		$(".tmb").append(
			`<div class="sessionsToggle" style="width:936px; margin:auto; background-color:#FFFFFF !important; border-radius: 5px; padding-bottom:105px; " >
			<div class="toggleBtns">
			<button class="renderUpcoming" data-type="navigation" data-navigate= "1" style="background-color: #fffffc !important; color:#3683F0 !important;"><span style="margin: 0 13px 0 24px;"><i class="far fa-clock" style="vertical-align:middle; font-size: 30px; "></i></span><span style="margin-right:50px; ">My Upcoming Sessions</span>
			</button><button class="renderPrevious" data-type="navigation" data-navigate= "-1" style=" background-color: #fffffc !important; color:#c4c4c4 !important;"><span style="margin: 0 13px;"><i class="far fa-clock" style="vertical-align:middle; font-size: 30px; "></i></span><span style="margin-right:50px; ">My Previous Sessions</span>
			</button><span class="ellipsis-h"><i></i><i></i><i></i></span>
			</div>
			<div class="sessionTable">
			<div class="thead">
			
			<span style="flex: 1.3; ">Date</span>
			<span style="flex: 5; " class="txt-left">Session Topic & Details</span>
			<span style="flex: 3.5; ">Session Time</span>
			<span style="flex: 2; ">Related Sessions</span>
			
			</div>
			<div class="tbody" style=""></div>
			</div>
			</div>
			`
		);

		// buttons css
		$(".toggleBtns").css({
			display: "flex",
			"align-items": "center",
			"height":"88px",
			width: "100%",
			"border-bottom":"1px solid #eee",

		});

		$("button.renderUpcoming").css({
			"height":"100%",
			"display":"flex",
			"align-items":"center",
			padding: "0",
			"border-right": "1px solid #EEE",
			"font-size": "20px",
			"line-height": "30px",
			"text-transform": "uppercase",
			"border-radius": "5px 0 0",
		});

		$("button.renderPrevious").css({
			padding: "0",
			"height":"100%",
			"display":"flex",
			"align-items":"center",
			"font-size": "20px",
			"line-height": "30px",
			"text-transform": "uppercase",
		});

		$(".ellipsis-h").css({
			"display":"flex",
			"align-items":"center",
			"margin-left": "auto",
			"width":"22px",
			"height":"22px",
			"margin-right": "25px",
			cursor: "pointer",
		});
		// session

		$(".ellipsis-h i").css({
			"background-color":"#C4C4C4",
			"width":"3.88px",
			"height":"3.88px",
			"border-radius":"10px",
			"margin-right":"5.18px",

		});

		$(".ellipsis-h i:last-child").css({
			"margin-right":"0",

		});

		// table css
		$(".sessionTable").css({
			"width":"100%",
			"margin-top":"8px",
			"border-bottom":"1px solid #eee",

		});

		$(".thead").css({
			"margin":"0 35px",
			"font-size":"20px",
			"display":"flex",
			"align-items":"flex-start",
			"line-height":"30px",

		});

		$(".tbody").css({
			"margin":"0 3.5%",
			"width":"93%",

		});

		$(".sessionTable td").css({
			"font-size": "12px",
			"line-height": "20px",
		});

		$that.renderUpcoming();
		$("[data-type = 'navigation']")
			.off("click")
			.on("click", function () {
				let navigate = $(this).data("navigate") || 0;
				$("body").find(".ue,.editSchedule,.pe,.SessionsDiv").remove();
				$("[data-type = 'navigation']").css({
					boxShadow: "0 0 10px rgba(0,0,0,0)",
				});
				$(this).css({
					boxShadow: "0 0 10px rgba(0,0,0,0.4)",
				});
				return navigate == -1 ? $that.renderPrevious() : $that.renderUpcoming();
			});
		// $(".renderUpcoming").on("click", () => {
		// 	$(".ue,.editSchedule,.pe").remove();
		// 	$that.renderUpcoming();
		// });
		// $(".renderPrevious").on("click", () => {
		// 	$(".ue,.editSchedule,.pe").remove();
		// 	$that.renderPrevious();
		// });
	};
	$monitorBoard.sessionsList = (params) => {
		var siteData = ajaxify.data;
		$monitorBoard.log(siteData);
		siteData.Sessions.sort((a, b) =>
			a.schedule > b.schedule ? 1 : b.schedule > a.schedule ? -1 : 0
		);
		if (params == "upcoming") {
			return siteData.Sessions.filter((el) => el.schedule > Date.now());
		} else if (params == "live") {
			return siteData.Sessions.filter(
				(el) => el.schedule + 3600000 >= Date.now() && Date.now() > el.schedule
			);
		} else {
			return siteData.Sessions.filter(
				(el) => el.schedule + 3600000 < Date.now()
			);
		}
	};
	$monitorBoard.checkClassStart = (session, className, appendData) => {
		if (!session) {
			console.log("something failed");
			return false;
		}
		if (session.schedule <= Date.now()) {
			console.log("apended");
			$(`.${className}`).append(appendData);
			if (!$monitorBoard.exists) {
				console.log("second check");
				$("body").find(".startClassBtn").attr("disabled", true);
			}
		}
	};
	$monitorBoard.formatDate = (date = new Date()) => {
		return date.toLocaleTimeString().split(" ").slice(0, 1).join(" ");
	};
	$monitorBoard.renderUpcoming = () => {
		var $that = $monitorBoard;
		$monitorBoard.sessionsList("upcoming").map((ev, i) => {
			var headId = `head-${ev.tid}`;
			var dt = new Date(ev.schedule).toDateString();
			var dateVal =
				"<span class='dateValSpan'><span style='color: #3683f0; '>" +
				dt.slice(0, 3) +
				"</span>" +
				"<br>" +
				dt.slice(8, 10) +
				"<br>" +
				dt.slice(4, 7).toUpperCase() + "</span>";
			$(".sessionTable .tbody").append(
				`
				<div class="sessionTableVal" >
					<span class="dateVal ${ev.tid}"  id="${headId}" style="font-size:10px;font-weight:600;color:#696969;text-align:center; padding: 15px 10px; flex: 1; transition: .3s ease; line-height: 15px;">${dateVal}</span> 
					<div class="secHover">
					<span class="stdVal" style="font-size:12px;font-weight:700; flex:8; letter-spacing: 0.02em;">${ev.topic} for ${ev.category} <br><span style="color:#696969; font-weight:normal;">on ${new Date(ev.schedule).toDateString()} at 8 PM</span></span>
					<span class="btnVal" style="margin-right:113px; flex:3; "><button style="background-color:rgb(54 131 240);font-size:10px;border:none;outline:none;border-radius:10px;padding:8px 12px;font-weight:bold;color:#FFFFFC;line-height: 15px;letter-spacing: 0.02em;">08:00 AM - 1:00 PM</button></span>
					<span class="rsVal" style="flex:3;"><span style="text-align:center;display:inline-block;width:40px;height:40px;background-color: #fafafa;border-radius:100%;font-size: 12px;padding-top:12px; transition: .3s ease;">${i}</span></span>
					</div>
				</div>`
				
				// <span> <button title="edit session" class="editSchedule btn btn-primary btn-sm" id=${ev.tid} name=${ev.topic} ><i class="fas fa-edit"></i></button> </span>
			);

			$(".sessionTableVal").css({
				"display":"flex",
				"align-items":"center",
				"background-color":"#FFFFFC",
				"font-family":"Poppins, sans-serif",
				"padding":"10px 0",
				"transition":".3s ease",
				"border-top":"0.5px solid #EEE",

			});

			$(".secHover").css({
				"margin-left":" 24px",
                "display":" flex",
                "flex":" 15",
                "align-items":" center",
                "padding":" 15px 10px",
				"transition":".3s ease",

			});

			

			$(".sessionTableVal").on("mouseenter", function () {
				$(this).find(".dateVal").css({"background-color":" #FAFAFA","box-shadow":" 0px 14px 20px rgb(0 0 0 / 10%)", "border-radius":" 10px",})
				$(this).find(".rsVal span").css({"background-color":" #fff"})
				}).on("mouseleave", function () {
					$(this).find(".dateVal").css({"background-color":" #fffffc","box-shadow":" none","border-radius":" 10px",})
					$(this).find(".rsVal span").css({"background-color":" #FAFAFA"})
				});

			$(".sessionTableVal").on("mouseenter", function () {
				$(this).find(".secHover").css({"background-color":" #FAFAFA","box-shadow":" 0px 14px 20px rgb(0 0 0 / 10%)","border-radius":" 10px",})
				$(this).find(".rsVal span").css({"background-color":" #fff"})
				}).on("mouseleave", function () {
					$(this).find(".secHover").css({"background-color":" #fffffc","box-shadow":" none","border-radius":" 10px",})
					$(this).find(".rsVal span").css({"background-color":" #FAFAFA"})
				});

			$(".sessionTableVal:first-child").css({
				"border-top":"none ",

			});

			if (ajaxify.data.isTeacher) {
				console.log(ev.tid);
				$monitorBoard.initEB(ev.tid, ev.tid);
			}
		});
		if (ajaxify.data.isStudent && !ajaxify.data.isTeacher) {
			$(".editSchedule").remove();
		}
		$("body").on("click", ".editSchedule", function () {
			$("#changeSession").remove();
			var refId = `head-${$(this).attr("id")}`;
			$(`#${refId}`)
				.parents(".SessionsDiv")
				.first().after(`<form id="changeSession" >
			<input type="hidden" value=${$(this).attr("id")} id="tid" name="tid"  >

			<sdlms style="display:block">
			<div><label for="topic" >New Topic</label>
			<input type="text" id="changedTopic" name="topic" value=${$(this).attr(
				"name"
			)} ></div>

			<div>
			<label for="changedDate">Schedule (date and time):</label>
			<input required type="datetime-local" id="changedDate" value="session" name="schedule">
			</div>
			
			</sdlms>
			<button class=" btn btn-primary">submit</button>
			
		  </form>`);
			// $(".editSchedule").remove();
		});
		$("body").on("submit", "#changeSession", function (e) {
			e.preventDefault();
			let $form = $(this);
			let dataArray = $form.serializeArray();
			let data = {};
			$.each(dataArray, (i, e) => {
				data[e.name] = e.value;
			});
			data.schedule = new Date(data.schedule).getTime();
			$that.log(data);
			api
				.put("/sdlms/monitor", data)
				.then((res) => {
					$that.log(res);
				})
				.catch((e) => {
					$that.log("error", e);
				})
				.finally(() => {
					$that.log("put requested");
				});
			location.reload();
		});
	};
	$monitorBoard.renderPrevious = () => {
		$monitorBoard.sessionsList("past").map((ev) =>
			$(".tmb")
				.find(".sessionsToggle")
				.append(
					`<div class="SessionsDiv" style="display:flex;margin-top:1rem" ><h4 class="pe" >${
						ev.topic
					} on ${new Date(ev.schedule).toDateString()} at ${new Date(
						ev.schedule
					)
						.toLocaleTimeString()
						.split(" ")
						.slice(0, 1)
						.join(" ")} </h4></div>`
				)
		);
	};
	$monitorBoard.initEB = (tid, target) => {
		$("#changeSession").remove();
		$(`.${target}`)
			.parents(".SessionsDiv")
			.first()
			.find("span")
			.append(
				`<button title="map EB" class="eagleBuilderBtn btn btn-primary btn-sm" id=${tid} data-tid="${tid}" style="margin-right:1rem;" > <i class="fas fa-paperclip"></i> </button>`
			);
		$(".eagleBuilderBtn")
			.off("click")
			.on("click", function (e) {
				var $id = $(this).data("tid");
				console.log($id);
				$("body").find(".EagleBuilderContainer,sdlms-eagle-builder").remove();
				if (!$(this).data("target")) {
					$(this)
						.parents(".SessionsDiv")
						.first()
						.after(
							`<div class="EagleBuilderContainer" data-id="${$id}" style="margin-top:10px;display:none" ></div>`
						);
				} else {
					$(`${$(this).data("target")}`).append(
						`<div class="EagleBuilderContainer" data-id="${$id}" style="margin-top:10px;display:none" ></div>`
					);
				}
				api.get(`/sdlms/${$id}/eaglebuilder`, {}).then((res) => {
					new eagleBuilder({
						tid: tid,
						log: true,
						tracks: 1, // Set as one only supported mupltiple
						threshold: true,
						warn: !true,
						canControl: true,
						action: "builder",
						target: ".EagleBuilderContainer",
						with: !!Object.keys(res).length ? res : undefined,
						req: !!Object.keys(res).length ? "put" : "post",
						id: res.id,
					});
					$(".EagleBuilderContainer").slideDown();
				});
			});
	};

	return $monitorBoard;
});

// $(window).on("sdlms:init:monitor", (event, data) => {
// 	new monitorBoard(data);
// });

/*
const format_TimeTaken = (val) => {
	var sec_num = parseInt(val / 1000); var secsUsed = 0; var years = Math.floor(sec_num / 31536000); if (years > 0) { secsUsed += (years * 31536000); }
	var months = Math.floor((sec_num - secsUsed) / 2628288); if (months > 0) { secsUsed += (months * 2628288); }
	var weeks = Math.floor((sec_num - secsUsed) / 604800); if (weeks > 0) { secsUsed += (weeks * 604800); }
	var days = Math.floor((sec_num - secsUsed) / 86400); if (days > 0) { secsUsed += (days * 86400); }
	var hours = Math.floor((sec_num - secsUsed) / 3600); if (hours > 0) { secsUsed += (hours * 3600); }
	var minutes = Math.floor((sec_num - secsUsed) / 60); if (minutes > 0) { secsUsed += (minutes * 60); }
	var seconds = sec_num - secsUsed;
	if (years > 0) { return years + ' Years ' + months + ' Months ' + weeks + ' Weeks ' + days + ' Days ' + hours + ' H ' + minutes + ' M ' + seconds + ' S'; }
	else if (months > 0) { return months + ' Months ' + weeks + ' Weeks ' + days + ' Days ' + hours + ' H ' + minutes + ' M ' + seconds + ' S'; }
	else if (weeks > 0) { return weeks + ' Weeks ' + days + ' Days ' + hours + ' H ' + minutes + ' M ' + seconds + ' S'; }
	else if (days > 0) { return days + ' Days ' + hours + ' H ' + minutes + ' M ' + seconds + ' S'; }
	else if (hours > 0) { return hours + ' H ' + minutes + ' M ' + seconds + ' S'; }
	else if (minutes > 0) { return minutes + ' M ' + seconds + ' S'; }
	else if (seconds > 0) { return seconds + ' S'; }
	else if (seconds == 0) { return 'less than a second'; }
	else { return days + ' Days ' + hours + ' H ' + minutes + ' M ' + seconds + ' S'; }
}

function renderupcomingClass(classInformation) {
	var timeLeftForEB = Math.floor(
		(classInformation[0].schedule - Date.now()) / 60000
	);
	var timeLeftForEBHr = Math.floor(timeLeftForEB / 60);
	var timeLeftForEBMin = timeLeftForEB % 60;

	$(".tmb").append(`
	<div class="classInfo" >
	<h3 class=" text-bold "> Your next session is on ${classInformation[0].topic} for ${classInformation[0].category}
	</h3>
	</div>
	`);
	if (checkForEB()) {
		$(".classInfo").append(
			`
			</h4> You have already mapped the eagle builder for ${classInformation[0].topic}  </h4>
			`
		);
	} else {
		$(".classInfo").append(
			`
			you got ${timeLeftForEBHr}hrs, ${timeLeftForEBMin}minutes to map the EB
			`
		);
	}
}
renderupcomingClass(this.sessionsList("upcoming"));
*/
