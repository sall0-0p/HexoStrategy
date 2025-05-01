// Camera.ts
import { UserInputService, RunService, Workspace } from "@rbxts/services";

export namespace Camera {
	// Configuration
	const edgeThreshold = 30;
	const cornerThreshold = 60;
	const edgeBaseSpeed = 50;
	const edgeMaxSpeed = 100;
	const edgeAcceleration = 1;
	const edgeDeceleration = 2;

	const wasdBaseSpeed = 50;
	const wasdMaxSpeed = 100;
	const wasdAcceleration = 1;
	const wasdDeceleration = 2;
	let wasdTime = 0;
	const lerpSpeed = 10;
	let lastWASDDirection = new Vector3(0, 0, 0);

	const zoomLerpSpeed = 5;
	const tiltInfluence = 0.3;
	const tiltLerpSpeed = 3;

	const rotationSpeed = 0.2;
	const tiltSpeed = 0.2;
	const minTilt = 15;
	const maxTilt = 75;

	const cameraBlock = new Instance("Part");
	cameraBlock.Transparency = 0;
	cameraBlock.Size = new Vector3(1, 1, 1);
	cameraBlock.Anchored = true;
	cameraBlock.CanQuery = false;
	cameraBlock.CanCollide = false;
	cameraBlock.Parent = Workspace;

	let currentY = 0;
	let targetY = 0;

	let currentRotation = 45;
	let currentTilt = 45;
	let currentRadius = 30;

	let targetRadius = currentRadius;

	let scrollTiltOffset = 0;
	let targetScrollTiltOffset = 0;

	let edgeTime = 0;
	let lastEdgeDirection = new Vector3(0, 0, 0);

	let directControlUnit: Model | undefined;
	let lastDirectControlPosition: Vector3 | undefined;

	Workspace.CurrentCamera!.CameraType = Enum.CameraType.Scriptable;

	function convertToCartesian(radius: number, tiltDeg: number, rotationDeg: number): Vector3 {
		const tilt = math.rad(tiltDeg);
		const rotation = math.rad(rotationDeg);

		const x = radius * math.cos(tilt) * math.cos(rotation);
		const y = radius * math.sin(tilt);
		const z = radius * math.cos(tilt) * math.sin(rotation);

		return new Vector3(x, y, z);
	}

	function processWASDMovement(deltaTime: number, wasdEnabled: boolean) {
		let moveDirection = new Vector3(0, 0, 0);

		if ((UserInputService.IsKeyDown(Enum.KeyCode.W) && wasdEnabled) || UserInputService.IsKeyDown(Enum.KeyCode.Up)) {
			moveDirection = moveDirection.add(new Vector3(0, 0, 1));
		}
		if ((UserInputService.IsKeyDown(Enum.KeyCode.S) && wasdEnabled) || UserInputService.IsKeyDown(Enum.KeyCode.Down)) {
			moveDirection = moveDirection.add(new Vector3(0, 0, -1));
		}
		if ((UserInputService.IsKeyDown(Enum.KeyCode.A) && wasdEnabled) || UserInputService.IsKeyDown(Enum.KeyCode.Left)) {
			moveDirection = moveDirection.add(new Vector3(-1, 0, 0));
		}
		if ((UserInputService.IsKeyDown(Enum.KeyCode.D) && wasdEnabled) || UserInputService.IsKeyDown(Enum.KeyCode.Right)) {
			moveDirection = moveDirection.add(new Vector3(1, 0, 0));
		}

		if (moveDirection.Magnitude > 0) {
			moveDirection = moveDirection.Unit;
			const camCFrame = Workspace.CurrentCamera!.CFrame;
			const forward = new Vector3(camCFrame.LookVector.X, 0, camCFrame.LookVector.Z).Unit;
			const right = new Vector3(camCFrame.RightVector.X, 0, camCFrame.RightVector.Z).Unit;
			const desiredDirection = forward.mul(moveDirection.Z).add(right.mul(moveDirection.X)).Unit;

			if (desiredDirection === lastWASDDirection) {
				wasdTime = math.min(wasdTime + wasdAcceleration * deltaTime, 1);
			} else {
				wasdTime = 0;
			}

			lastWASDDirection = desiredDirection;

			const currentSpeed = wasdBaseSpeed + (wasdMaxSpeed - wasdBaseSpeed) * wasdTime;
			const movement = desiredDirection.mul(currentSpeed * deltaTime);
			cameraBlock.Position = cameraBlock.Position.add(new Vector3(movement.X, 0, movement.Z));
		} else if (wasdTime > 0) {
			wasdTime = math.max(wasdTime - wasdDeceleration * deltaTime, 0);
		}
	}

	function processCameraBlock(deltaTime: number) {
		processWASDMovement(deltaTime, directControlUnit === undefined);

		if (directControlUnit && lastDirectControlPosition) {
			const pivot = directControlUnit.GetPivot().Position;
			cameraBlock.Position = cameraBlock.Position.sub(lastDirectControlPosition.sub(pivot));
			lastDirectControlPosition = pivot;
		}

		// Bind to terrain
		const origin = cameraBlock.Position.add(new Vector3(0, 125, 0));
		const direction = new Vector3(0, -150, 0);
		const params = new RaycastParams();
		params.FilterType = Enum.RaycastFilterType.Include;
		params.FilterDescendantsInstances = [Workspace.WaitForChild("PartTerrain")];
		const result = Workspace.Raycast(origin, direction, params);

		targetY = result ? result.Position.Y : 0;
		currentY += (targetY - currentY) * math.clamp(lerpSpeed * deltaTime, 0, 1);
		cameraBlock.Position = new Vector3(cameraBlock.Position.X, currentY, cameraBlock.Position.Z);
	}

	function processCamera(deltaTime: number) {
		if (UserInputService.IsKeyDown(Enum.KeyCode.E)) currentRotation -= 2;
		if (UserInputService.IsKeyDown(Enum.KeyCode.Q)) currentRotation += 2;
		if (UserInputService.IsKeyDown(Enum.KeyCode.T)) currentTilt += 2;
		if (UserInputService.IsKeyDown(Enum.KeyCode.F)) currentTilt -= 2;

		const finalTilt = math.clamp(currentTilt + scrollTiltOffset, minTilt, maxTilt);

		Workspace.CurrentCamera!.CFrame = CFrame.lookAt(
			cameraBlock.Position.add(convertToCartesian(currentRadius, finalTilt, currentRotation)),
			cameraBlock.Position
		);
	}

	function addRotation() {
		let isRightMousePressed = false;
		let startMousePos: Vector2 | undefined;

		UserInputService.InputBegan.Connect((input: InputObject) => {
			if (input.UserInputType === Enum.UserInputType.MouseButton3) {
				isRightMousePressed = true;
				startMousePos = UserInputService.GetMouseLocation();
			}
		});

		UserInputService.InputEnded.Connect((input: InputObject) => {
			if (input.UserInputType === Enum.UserInputType.MouseButton3) {
				isRightMousePressed = false;
			}
		});

		RunService.RenderStepped.Connect(() => {
			if (isRightMousePressed && startMousePos) {
				const currentPos = UserInputService.GetMouseLocation();
				const delta = currentPos.sub(startMousePos);

				if (delta.Magnitude > 1) {
					currentRotation += delta.X * rotationSpeed;
					currentTilt = math.clamp(currentTilt - delta.Y * tiltSpeed, minTilt, maxTilt);
					startMousePos = currentPos;
				}
			}
		});
	}

	function processEdgeScrolling(deltaTime: number) {
		const size = Workspace.CurrentCamera!.ViewportSize;
		const mousePos = UserInputService.GetMouseLocation();
		const x = mousePos.X;
		const y = mousePos.Y;

		const atLeft = x < edgeThreshold;
		const atRight = x > size.X - edgeThreshold;
		const atTop = y < edgeThreshold;
		const atBottom = y > size.Y - edgeThreshold;

		const atTopLeftCorner = atLeft && atTop && x < cornerThreshold && y < cornerThreshold;
		const atTopRightCorner = atRight && atTop && x > size.X - cornerThreshold && y < cornerThreshold;
		const atBottomLeftCorner = atLeft && atBottom && x < cornerThreshold && y > size.Y - cornerThreshold;
		const atBottomRightCorner = atRight && atBottom && x > size.X - cornerThreshold && y > size.Y - cornerThreshold;

		let moveX = 0;
		let moveZ = 0;

		if (atTopLeftCorner)        { moveX = -1; moveZ = 1; }
		else if (atTopRightCorner)  { moveX = 1;  moveZ = 1; }
		else if (atBottomLeftCorner){ moveX = -1; moveZ = -1; }
		else if (atBottomRightCorner){moveX = 1;  moveZ = -1; }
		else {
			if (atLeft)  moveX = -1;
			if (atRight) moveX = 1;
			if (atTop)   moveZ = 1;
			if (atBottom)moveZ = -1;
		}

		const edgeDirection = new Vector3(moveX, 0, moveZ);
		if (edgeDirection.Magnitude > 0) {
			if (edgeDirection === lastEdgeDirection) {
				edgeTime = math.min(edgeTime + edgeAcceleration * deltaTime, 1);
			} else {
				edgeTime = 0;
			}
			lastEdgeDirection = edgeDirection;

			const speed = edgeBaseSpeed + (edgeMaxSpeed - edgeBaseSpeed) * edgeTime;
			const camCFrame = Workspace.CurrentCamera!.CFrame;
			const forward = new Vector3(camCFrame.LookVector.X, 0, camCFrame.LookVector.Z).Unit;
			const right = new Vector3(camCFrame.RightVector.X, 0, camCFrame.RightVector.Z).Unit;

			const relative = forward.mul(moveZ).add(right.mul(moveX)).Unit.mul(speed * deltaTime);
			cameraBlock.Position = cameraBlock.Position.add(new Vector3(relative.X, 0, relative.Z));
		} else if (edgeTime > 0) {
			edgeTime = math.max(edgeTime - edgeDeceleration * deltaTime, 0);
			lastEdgeDirection = new Vector3(0, 0, 0);
		}
	}

	function onRenderStepped(deltaTime: number) {
		processCameraBlock(deltaTime);

		// Uncomment to enable edge scrolling (needs tuning)
		// processEdgeScrolling(deltaTime);

		currentRadius += (targetRadius - currentRadius) * math.clamp(zoomLerpSpeed * deltaTime, 0, 1);
		scrollTiltOffset += (targetScrollTiltOffset - scrollTiltOffset) * math.clamp(tiltLerpSpeed * deltaTime, 0, 1);

		processCamera(deltaTime);
	}

	export function Init() {
		UserInputService.InputChanged.Connect((input: InputObject) => {
			if (input.UserInputType === Enum.UserInputType.MouseWheel) {
				targetRadius = math.clamp(targetRadius - input.Position.Z * 3, 10, 100);
				targetScrollTiltOffset -= input.Position.Z * tiltInfluence;
			}
		});

		addRotation();
		RunService.RenderStepped.Connect(onRenderStepped);
	}

	export function SetDirectControlUnit(unit?: Model) {
		directControlUnit = unit;
		lastDirectControlPosition = unit ? unit.GetPivot().Position : undefined;
	}
}
